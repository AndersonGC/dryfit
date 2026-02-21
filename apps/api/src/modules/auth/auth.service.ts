import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const generateInviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async registerStudent(data: {
    email: string;
    password: string;
    name: string;
    inviteCode: string;
  }) {
    // Validate invite code
    const invite = await this.prisma.inviteCode.findUnique({
      where: { code: data.inviteCode },
      include: { coach: true },
    });

    if (!invite) {
      throw new Error('Código do professor inválido. Verifique com seu coach.');
    }

    if (invite.usedAt) {
      throw new Error('Código de convite já utilizado.');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Run user creation and invite invalidation in a transaction to prevent race conditions
    const student = await this.prisma.$transaction(async (tx) => {
      const newStudent = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'STUDENT',
          coachId: invite.coach.id,
        },
      });

      // Invalidate the code
      await tx.inviteCode.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date(),
          usedBy: newStudent.id,
        },
      });

      return newStudent;
    });

    const { password: _, ...studentWithoutPassword } = student;
    return studentWithoutPassword;
  }

  async generateCoachInviteCode(coachId: string) {
    const randomPart = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 5)();
    const code = `DRFT-${randomPart}`;

    const inviteCode = await this.prisma.inviteCode.create({
      data: {
        code,
        coachId,
      },
    });

    return inviteCode;
  }
}
