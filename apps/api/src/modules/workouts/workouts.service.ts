import { PrismaClient } from '@prisma/client';

interface CreateWorkoutData {
  title: string;
  youtubeVideoId?: string;
  blocks: { categoryId: string; description: string }[];
  studentId: string;
  coachId: string;
  scheduledAt?: string; // ISO 8601 — allows future scheduling
}

/** Returns start and end of a calendar day in UTC for a given YYYY-MM-DD string */
function dayRangeUTC(dateStr: string): { gte: Date; lt: Date } {
  const gte = new Date(`${dateStr}T00:00:00.000Z`);
  const lt = new Date(`${dateStr}T00:00:00.000Z`);
  lt.setUTCDate(lt.getUTCDate() + 1);
  return { gte, lt };
}

/** YYYY-MM-DD for today in UTC */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export class WorkoutsService {
  constructor(private prisma: PrismaClient) {}

  async createWorkout(data: CreateWorkoutData) {
    // Verify student belongs to this coach
    const student = await this.prisma.user.findFirst({
      where: { id: data.studentId, coachId: data.coachId, role: 'STUDENT' },
    });

    if (!student) {
      throw new Error('Aluno não encontrado ou não pertence a este professor.');
    }

    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : new Date();

    const workout = await this.prisma.workout.create({
      data: {
        title: data.title,
        youtubeVideoId: data.youtubeVideoId,
        blocks: {
          create: data.blocks.map((block, index) => ({
            categoryId: block.categoryId,
            description: block.description,
            order: index,
          }))
        },
        coachId: data.coachId,
        studentId: data.studentId,
        scheduledAt,
      },
      include: {
        blocks: {
          include: { category: true }
        }
      }
    });

    return workout;
  }

  /**
   * Returns the workout for a student on a specific date (any status).
   * If no date given, falls back to today UTC.
   */
  async getWorkoutByDate(studentId: string, date?: string) {
    const targetDate = date ?? todayUTC();
    const range = dayRangeUTC(targetDate);

    return this.prisma.workout.findFirst({
      where: {
        studentId,
        scheduledAt: range,
      },
      include: {
        coach: { select: { name: true } },
        blocks: { include: { category: true }, orderBy: { order: 'asc' } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getStudentWorkouts(studentId: string) {
    return this.prisma.workout.findMany({
      where: { studentId },
      include: { coach: { select: { name: true } }, blocks: { include: { category: true }, orderBy: { order: 'asc' } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /** @deprecated use getWorkoutByDate instead */
  async getActiveWorkout(studentId: string) {
    return this.prisma.workout.findFirst({
      where: { studentId, status: 'PENDING' },
      include: { coach: { select: { name: true } }, blocks: { include: { category: true }, orderBy: { order: 'asc' } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async completeWorkout(workoutId: string, studentId: string, studentFeedback?: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, studentId },
    });

    if (!workout) {
      throw new Error('Treino não encontrado.');
    }

    return this.prisma.workout.update({
      where: { id: workoutId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        studentFeedback,
      },
    });
  }

  async getCoachStudentsByDate(coachId: string, dateStr: string) {
    // 1. Fetch all students for this coach
    const students = await this.prisma.user.findMany({
      where: { coachId, role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });

    // 2. Find workouts for these students on the given date
    const range = dayRangeUTC(dateStr);
    const workouts = await this.prisma.workout.findMany({
      where: {
        coachId,
        scheduledAt: range,
      },
      select: {
        id: true,
        studentId: true,
        status: true,
        studentFeedback: true,
        title: true,
        blocks: {
          include: { category: true },
          orderBy: { order: 'asc' }
        },
      },
    });

    // 3. Map students and add workout details
    const workoutsByStudent = new Map(workouts.map((w) => [w.studentId, w]));
    
    const mappedStudents = students.map((student) => {
      const workout = workoutsByStudent.get(student.id);
      return {
        ...student,
        hasWorkout: !!workout,
        workoutId: workout?.id || null,
        workoutStatus: workout?.status || null,
        workoutTitle: workout?.title || null,
        workoutBlocks: workout?.blocks || null,
        studentFeedback: workout?.studentFeedback || null,
      };
    });

    // 4. Sort: students WITHOUT workout first (hasWorkout: false), then by name
    return mappedStudents.sort((a, b) => {
      if (a.hasWorkout === b.hasWorkout) return 0;
      return a.hasWorkout ? 1 : -1;
    });
  }

  async getCoachWorkouts(coachId: string) {
    return this.prisma.workout.findMany({
      where: { coachId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        blocks: { include: { category: true }, orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWorkout(workoutId: string, coachId: string, data: Partial<CreateWorkoutData>) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, coachId },
    });

    if (!workout) {
      throw new Error('Treino não encontrado ou você não tem permissão.');
    }

    if (workout.status !== 'PENDING') {
      throw new Error('Apenas treinos pendentes podem ser alterados.');
    }

    // Replace blocks if provided
    let blocksUpdate = {};
    if (data.blocks) {
      blocksUpdate = {
        deleteMany: {}, // Delete all existing blocks
        create: data.blocks.map((block, index) => ({
          categoryId: block.categoryId,
          description: block.description,
          order: index,
        }))
      };
    }

    return this.prisma.workout.update({
      where: { id: workoutId },
      data: {
        title: data.title !== undefined ? data.title : workout.title,
        blocks: blocksUpdate,
      },
      include: {
        blocks: { include: { category: true }, orderBy: { order: 'asc' } }
      }
    });
  }

  async deleteWorkout(workoutId: string, coachId: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, coachId },
    });

    if (!workout) {
      throw new Error('Treino não encontrado ou você não tem permissão.');
    }

    if (workout.status !== 'PENDING') {
      throw new Error('Apenas treinos pendentes podem ser excluídos.');
    }

    return this.prisma.workout.delete({
      where: { id: workoutId },
    });
  }
}
