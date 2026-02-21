import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const generateInviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

async function main() {
  console.log('🌱 Seeding database...');

  // Create coach accounts (pre-created by admins)
  const coaches = [
    { name: 'Coach Anderson', email: 'anderson@dryfit.app', password: 'coach1234' },
    { name: 'Coach Maria', email: 'maria@dryfit.app', password: 'coach1234' },
  ];

  for (const coach of coaches) {
    const hashedPassword = await bcrypt.hash(coach.password, 12);
    const inviteCode = generateInviteCode();

    const created = await prisma.user.upsert({
      where: { email: coach.email },
      update: {},
      create: {
        email: coach.email,
        password: hashedPassword,
        name: coach.name,
        role: 'COACH',
        inviteCode,
      },
    });

    console.log(`✅ Coach created: ${created.name} | Invite Code: ${created.inviteCode}`);
  }

  console.log('\n🎉 Seed completed!');
  console.log('\n📝 Coach credentials:');
  coaches.forEach(c => {
    console.log(`  Email: ${c.email} | Password: ${c.password}`);
  });
  console.log('\n⚠️  Use the invite codes printed above to register students.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
