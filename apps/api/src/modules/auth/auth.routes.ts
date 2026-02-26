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

  // POST /auth/verify-email/send
  fastify.post<{
    Body: { email: string };
  }>('/verify-email/send', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email } = request.body;
        await authService.sendVerificationCode(email);
        return reply.status(200).send({ success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao enviar código.';
        return reply.status(400).send({ error: message });
      }
    },
  });

  // POST /auth/verify-email/confirm
  fastify.post<{
    Body: { email: string; code: string };
  }>('/verify-email/confirm', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string', minLength: 6, maxLength: 6 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, code } = request.body;
        await authService.confirmVerificationCode(email, code);

        const verificationToken = fastify.jwt.sign(
          { email, type: 'OTP_VERIFIED' },
          { expiresIn: '30m' }
        );

        return reply.status(200).send({ success: true, verificationToken });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Código inválido.';
        return reply.status(400).send({ error: message });
      }
    },
  });

  // POST /auth/register (STUDENTS ONLY)
  fastify.post<{
    Body: { email: string; password: string; name: string; inviteCode: string; verificationToken: string };
  }>('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'name', 'inviteCode', 'verificationToken'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 2 },
          inviteCode: { type: 'string' },
          verificationToken: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, password, name, inviteCode, verificationToken } = request.body;

        try {
          const decoded = fastify.jwt.verify<{ email: string; type: string }>(verificationToken);
          if (decoded.email !== email || decoded.type !== 'OTP_VERIFIED') {
            throw new Error();
          }
        } catch {
          return reply.status(401).send({ error: 'Token de verificação de e-mail inválido ou expirado.' });
        }

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
