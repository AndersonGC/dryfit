import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  // POST /auth/login
  fastify.post<{
    Body: { email: string; password: string };
  }>('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;
        const user = await authService.login(email, password);

        const token = fastify.jwt.sign(
          { id: user.id, email: user.email, role: user.role, name: user.name },
          { expiresIn: '7d' }
        );

        return reply.status(200).send({ token, user });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao fazer login.';
        return reply.status(401).send({ error: message });
      }
    },
  });

  // POST /auth/register (STUDENTS ONLY)
  fastify.post<{
    Body: { email: string; password: string; name: string; inviteCode: string };
  }>('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'name', 'inviteCode'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 2 },
          inviteCode: { type: 'string', minLength: 6, maxLength: 6 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, password, name, inviteCode } = request.body;
        const student = await authService.registerStudent({ email, password, name, inviteCode });

        const token = fastify.jwt.sign(
          { id: student.id, email: student.email, role: student.role, name: student.name },
          { expiresIn: '7d' }
        );

        return reply.status(201).send({ token, user: student });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao cadastrar.';
        const statusCode = message.includes('inválido') ? 400 : 409;
        return reply.status(statusCode).send({ error: message });
      }
    },
  });
}
