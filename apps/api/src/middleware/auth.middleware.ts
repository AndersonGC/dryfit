import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Não autorizado. Faça login para continuar.' });
  }
}

export async function requireCoach(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as { role: string };
    if (payload.role !== 'COACH') {
      reply.status(403).send({ error: 'Acesso restrito a professores.' });
    }
  } catch {
    reply.status(401).send({ error: 'Não autorizado.' });
  }
}

export async function requireStudent(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const payload = request.user as { role: string };
    if (payload.role !== 'STUDENT') {
      reply.status(403).send({ error: 'Acesso restrito a alunos.' });
    }
  } catch {
    reply.status(401).send({ error: 'Não autorizado.' });
  }
}
