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
    const coach = await this.prisma.user.findFirst({
      where: { inviteCode: data.inviteCode, role: 'COACH' },
    });

    if (!coach) {
      throw new Error('Código do professor inválido. Verifique com seu coach.');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const student = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'STUDENT',
        coachId: coach.id,
      },
    });

    const { password: _, ...studentWithoutPassword } = student;
    return studentWithoutPassword;
  }
}
