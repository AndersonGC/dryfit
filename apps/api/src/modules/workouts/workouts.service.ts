import { PrismaClient } from '@prisma/client';

interface CreateWorkoutData {
  title: string;
  type: 'STRENGTH' | 'WOD' | 'HIIT' | 'CUSTOM';
  studentId: string;
  coachId: string;
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

    const workout = await this.prisma.workout.create({
      data: {
        title: data.title,
        type: data.type,
        coachId: data.coachId,
        studentId: data.studentId,
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

  async getStudentWorkouts(studentId: string) {
    return this.prisma.workout.findMany({
      where: { studentId },
      include: { exercises: { orderBy: { order: 'asc' } }, coach: { select: { name: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
  }

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
