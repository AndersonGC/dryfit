import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { EmailService } from '../../services/email.service';

const generateInviteCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
const generateOtp = customAlphabet('0123456789', 6);

export class AuthService {
  private emailService: EmailService;

  constructor(private prisma: PrismaClient) {
    this.emailService = new EmailService();
  }

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

  async sendVerificationCode(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.prisma.emailVerification.upsert({
      where: { email },
      create: { email, code, expiresAt },
      update: { code, expiresAt },
    });

    await this.emailService.sendVerificationCode(email, code);
    return true;
  }

  async confirmVerificationCode(email: string, code: string) {
    const record = await this.prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!record || record.code !== code) {
      throw new Error('Código de verificação inválido.');
    }

    if (record.expiresAt < new Date()) {
      throw new Error('O código de verificação expirou.');
    }

    await this.prisma.emailVerification.delete({ where: { id: record.id } });
    return true;
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
