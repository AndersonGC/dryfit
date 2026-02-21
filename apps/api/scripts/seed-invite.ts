import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const coach = await prisma.user.findFirst({ where: { role: 'COACH' } });
  if (!coach) throw new Error('No coach found');

  const invite = await prisma.inviteCode.create({
    data: {
      code: 'DRFT-SEED',
      coachId: coach.id,
    }
  });

  console.log(`Created test invite code: ${invite.code}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
