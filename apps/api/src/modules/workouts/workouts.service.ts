import { PrismaClient } from '@prisma/client';

interface CreateWorkoutData {
  title: string;
  type: 'STRENGTH' | 'WOD' | 'HIIT' | 'CUSTOM';
  studentId: string;
  coachId: string;
  scheduledAt?: string; // ISO 8601 — allows future scheduling
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: string;
    weight?: string;
    duration?: string;
    rounds?: number;
    order: number;
  }>;
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
        type: data.type,
        coachId: data.coachId,
        studentId: data.studentId,
        scheduledAt,
        exercises: {
          create: data.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            duration: exercise.duration,
            rounds: exercise.rounds,
            order: exercise.order,
          })),
        },
      },
      include: { exercises: { orderBy: { order: 'asc' } } },
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
        exercises: { orderBy: { order: 'asc' } },
        coach: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getStudentWorkouts(studentId: string) {
    return this.prisma.workout.findMany({
      where: { studentId },
      include: { exercises: { orderBy: { order: 'asc' } }, coach: { select: { name: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /** @deprecated use getWorkoutByDate instead */
  async getActiveWorkout(studentId: string) {
    return this.prisma.workout.findFirst({
      where: { studentId, status: 'PENDING' },
      include: { exercises: { orderBy: { order: 'asc' } }, coach: { select: { name: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async completeWorkout(workoutId: string, studentId: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, studentId },
    });

    if (!workout) {
      throw new Error('Treino não encontrado.');
    }

    return this.prisma.workout.update({
      where: { id: workoutId },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { exercises: { orderBy: { order: 'asc' } } },
    });
  }

  async getCoachWorkouts(coachId: string) {
    return this.prisma.workout.findMany({
      where: { coachId },
      include: {
        exercises: { orderBy: { order: 'asc' } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
