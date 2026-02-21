export type Role = 'COACH' | 'STUDENT';

export type WorkoutType = 'STRENGTH' | 'WOD' | 'HIIT' | 'CUSTOM';
export type WorkoutStatus = 'PENDING' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  inviteCode?: string;
  coachId?: string;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: string;
  weight?: string;
  duration?: string;
  rounds?: number;
  order: number;
  workoutId: string;
}

export interface Workout {
  id: string;
  title: string;
  type: WorkoutType;
  status: WorkoutStatus;
  exercises: Exercise[];
  coachId: string;
  studentId: string;
  scheduledAt: string;
  completedAt?: string;
  createdAt: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  name: string;
  inviteCode: string;
}

export interface CreateWorkoutRequest {
  title: string;
  type: WorkoutType;
  studentId: string;
  exercises: Omit<Exercise, 'id' | 'workoutId'>[];
}
