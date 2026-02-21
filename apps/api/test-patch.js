const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.workout.findMany().then(ws => {
  console.log("Workouts: ", ws.map(w => w.id));
  prisma.$disconnect();
});
