import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { prismaPlugin } from './plugins/prisma';
import { authRoutes } from './modules/auth/auth.routes';
import { workoutsRoutes } from './modules/workouts/workouts.routes';
import { usersRoutes } from './modules/users/users.routes';
import { categoriesRoutes } from './modules/categories/categories.routes';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

// Plugins
app.register(cors, {
  origin: true,
  credentials: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dryfit-fallback-secret',
});

app.register(prismaPlugin);

// Routes
app.register(authRoutes, { prefix: '/auth' });
app.register(workoutsRoutes, { prefix: '/workouts' });
app.register(usersRoutes, { prefix: '/users' });
app.register(categoriesRoutes, { prefix: '/categories' });

// Health check
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT ?? 3333);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 DryFit API running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
