import { FastifyInstance } from 'fastify';
import { authenticate, requireCoach } from '../../middleware/auth.middleware';
import { AuthService } from '../auth/auth.service';

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
          avatarUrl: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }

      return reply.send(user);
    },
  });

  // PATCH /users/me — Update current user data
  fastify.patch<{
    Body: { avatarUrl?: string };
  }>('/me', {
    preHandler: [authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          avatarUrl: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const jwtUser = request.user as JWTPayload;
      const { avatarUrl } = request.body;

      try {
        const user = await fastify.prisma.user.update({
          where: { id: jwtUser.id },
          data: {
            ...(avatarUrl !== undefined && { avatarUrl }),
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            inviteCode: true,
            coachId: true,
            coach: { select: { name: true } },
            createdAt: true,
            avatarUrl: true,
          },
        });

        return reply.send(user);
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao atualizar usuário.' });
      }
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
          avatarUrl: true,
        },
        orderBy: { name: 'asc' },
      });

      return reply.send({ students });
    },
  });

  const authService = new AuthService(fastify.prisma);

  // GET /users/invite-code — Coach: get their current valid invite code
  fastify.get('/invite-code', {
    preHandler: [requireCoach],
    handler: async (request, reply) => {
      const coach = request.user as JWTPayload;
      
      // Look for the latest unused invite code
      const invite = await fastify.prisma.inviteCode.findFirst({
        where: { coachId: coach.id, usedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      if (!invite) {
        return reply.status(404).send({ error: 'Nenhum código de convite ativo encontrado.' });
      }

      return reply.send({ inviteCode: invite.code });
    },
  });

  // POST /users/invite-code — Coach: generate a new invite code
  fastify.post('/invite-code', {
    preHandler: [requireCoach],
    handler: async (request, reply) => {
      const coach = request.user as JWTPayload;
      const inviteCode = await authService.generateCoachInviteCode(coach.id);
      return reply.status(201).send({ inviteCode: inviteCode.code });
    },
  });
}
