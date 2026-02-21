import { FastifyInstance } from 'fastify';
import { authenticate, requireCoach } from '../../middleware/auth.middleware';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function usersRoutes(fastify: FastifyInstance) {
  // GET /users/me — Current user data
  fastify.get('/me', {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      const jwtUser = request.user as JWTPayload;
      const user = await fastify.prisma.user.findUnique({
        where: { id: jwtUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          inviteCode: true,
          coachId: true,
          coach: { select: { name: true } },
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }

      return reply.send(user);
    },
  });

  // GET /users/students — Coach: list their students
  fastify.get('/students', {
    preHandler: [requireCoach],
    handler: async (request, reply) => {
      const coach = request.user as JWTPayload;
      const students = await fastify.prisma.user.findMany({
        where: { coachId: coach.id, role: 'STUDENT' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });

      return reply.send({ students });
    },
  });

  // GET /users/invite-code — Coach: get their invite code
  fastify.get('/invite-code', {
    preHandler: [requireCoach],
    handler: async (request, reply) => {
      const coach = request.user as JWTPayload;
      const user = await fastify.prisma.user.findUnique({
        where: { id: coach.id },
        select: { inviteCode: true },
      });

      if (!user?.inviteCode) {
        return reply.status(404).send({ error: 'Código de convite não encontrado.' });
      }

      return reply.send({ inviteCode: user.inviteCode });
    },
  });
}
