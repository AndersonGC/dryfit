import { FastifyInstance } from 'fastify';
import { WorkoutsService } from './workouts.service';
import { authenticate, requireCoach, requireStudent } from '../../middleware/auth.middleware';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function workoutsRoutes(fastify: FastifyInstance) {
  const workoutsService = new WorkoutsService(fastify.prisma);

  // POST /workouts — Coach only
  fastify.post<{
    Body: {
      title: string;
      type: 'STRENGTH' | 'WOD' | 'HIIT' | 'CUSTOM';
      studentId: string;
      exercises: Array<{
        name: string;
        sets?: number;
        reps?: string;
        weight?: string;
        duration?: string;
        rounds?: number;
        order: number;
      }>;
    };
  }>('/', {
    preHandler: [requireCoach],
    schema: {
      body: {
        type: 'object',
        required: ['title', 'studentId', 'exercises'],
        properties: {
          title: { type: 'string', minLength: 1 },
          type: { type: 'string', enum: ['STRENGTH', 'WOD', 'HIIT', 'CUSTOM'] },
          studentId: { type: 'string' },
          exercises: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['name', 'order'],
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'string' },
                weight: { type: 'string' },
                duration: { type: 'string' },
                rounds: { type: 'number' },
                order: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const coach = request.user as JWTPayload;
        const workout = await workoutsService.createWorkout({
          ...request.body,
          coachId: coach.id,
        });
        return reply.status(201).send(workout);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar treino.';
        return reply.status(400).send({ error: message });
      }
    },
  });

  // GET /workouts — Student: get active workout | Coach: get all workouts
  fastify.get('/', {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const user = request.user as JWTPayload;

      if (user.role === 'STUDENT') {
        const workout = await workoutsService.getActiveWorkout(user.id);
        return reply.send({ workout });
      }

      if (user.role === 'COACH') {
        const workouts = await workoutsService.getCoachWorkouts(user.id);
        return reply.send({ workouts });
      }

      return reply.status(403).send({ error: 'Acesso negado.' });
    },
  });

  // PATCH /workouts/:id/complete — Student only
  fastify.patch<{ Params: { id: string } }>('/:id/complete', {
    preHandler: [requireStudent],
    handler: async (request, reply) => {
      try {
        const user = request.user as JWTPayload;
        const workout = await workoutsService.completeWorkout(request.params.id, user.id);
        return reply.send(workout);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao concluir treino.';
        return reply.status(404).send({ error: message });
      }
    },
  });
}
