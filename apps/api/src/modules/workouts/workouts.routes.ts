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
      youtubeVideoId?: string;
      blocks: { categoryId: string; description: string }[];
      studentId: string;
      scheduledAt?: string;
    };
  }>('/', {
    preHandler: [requireCoach],
    schema: {
      body: {
        type: 'object',
        required: ['title', 'studentId', 'blocks'],
        properties: {
          title: { type: 'string', minLength: 1 },
          youtubeVideoId: { type: 'string' },
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              required: ['categoryId', 'description'],
              properties: {
                categoryId: { type: 'string' },
                description: { type: 'string' },
              }
            }
          },
          studentId: { type: 'string' },
          // ISO 8601 date string — e.g. "2026-02-25T14:00:00.000Z"
          scheduledAt: { type: 'string' },
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

  // GET /workouts — Student: get workout by date | Coach: get all workouts
  // Query: ?date=YYYY-MM-DD (optional, student only — defaults to today UTC)
  fastify.get<{ Querystring: { date?: string } }>('/', {
    preHandler: [authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
      },
    },
    handler: async (request, reply) => {
      const user = request.user as JWTPayload;

      if (user.role === 'STUDENT') {
        const { date } = request.query;
        const workout = await workoutsService.getWorkoutByDate(user.id, date);
        return reply.send({ workout });
      }

      if (user.role === 'COACH') {
        const workouts = await workoutsService.getCoachWorkouts(user.id);
        return reply.send({ workouts });
      }

      return reply.status(403).send({ error: 'Acesso negado.' });
    },
  });

  // GET /workouts/coach/by-date — Coach: get students with hasWorkout flag
  fastify.get<{ Querystring: { date?: string } }>('/coach/by-date', {
    preHandler: [requireCoach],
    schema: {
      querystring: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
      },
    },
    handler: async (request, reply) => {
      const coach = request.user as JWTPayload;
      const { date } = request.query;
      
      if (!date) {
        return reply.status(400).send({ error: 'A data é obrigatória.' });
      }

      const students = await workoutsService.getCoachStudentsByDate(coach.id, date);
      return reply.send({ students });
    },
  });

  // PATCH /workouts/:id/complete — Student only
  fastify.patch<{
    Params: { id: string };
    Body: { studentFeedback?: string };
  }>('/:id/complete', {
    preHandler: [requireStudent],
    schema: {
      body: {
        type: 'object',
        properties: {
          studentFeedback: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const user = request.user as JWTPayload;
        const { studentFeedback } = request.body || {};
        const workout = await workoutsService.completeWorkout(
          request.params.id,
          user.id,
          studentFeedback
        );
        return reply.send(workout);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao concluir treino.';
        return reply.status(404).send({ error: message });
      }
    },
  });

  // PATCH /workouts/:id — Coach: update workout
  fastify.patch<{
    Params: { id: string };
    Body: {
      title?: string;
      blocks?: { categoryId: string; description: string }[];
    };
  }>('/:id', {
    preHandler: [requireCoach],
    schema: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          blocks: {
            type: 'array',
            items: {
              type: 'object',
              required: ['categoryId', 'description'],
              properties: {
                categoryId: { type: 'string' },
                description: { type: 'string' },
              }
            }
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const coach = request.user as JWTPayload;
        const workout = await workoutsService.updateWorkout(
          request.params.id,
          coach.id,
          request.body
        );
        return reply.send(workout);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar treino.';
        return reply.status(400).send({ error: message });
      }
    },
  });

  // DELETE /workouts/:id — Coach: delete workout
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [requireCoach],
    handler: async (request, reply) => {
      try {
        const coach = request.user as JWTPayload;
        await workoutsService.deleteWorkout(
          request.params.id,
          coach.id
        );
        return reply.status(204).send();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao excluir treino.';
        return reply.status(400).send({ error: message });
      }
    },
  });
}
