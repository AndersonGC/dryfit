import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';

export async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: [authenticate],
    handler: async (_request, reply) => {
      const categories = await fastify.prisma.workoutCategory.findMany({
        orderBy: { name: 'asc' },
      });
      return reply.send({ categories });
    },
  });
}
