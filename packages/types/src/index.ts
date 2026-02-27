export type Role = 'COACH' | 'STUDENT';

export interface WorkoutCategory {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutBlock {
  id: string;
  workoutId: string;
  categoryId: string;
  category?: WorkoutCategory;
  description?: string | null;
  order: number;
}

export type WorkoutStatus = 'PENDING' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  inviteCode?: string;
  coachId?: string;
  createdAt: string;
}

export interface Workout {
  id: string;
  title: string;
  youtubeVideoId?: string | null;
  blocks?: WorkoutBlock[];
  status: WorkoutStatus;
  coachId: string;
  studentId: string;
  scheduledAt: string;
  completedAt?: string;
  studentFeedback?: string | null;
  createdAt: string;
  // Included by the API when fetching for the student view
  coach?: { name: string };
}

export interface StudentWithWorkout extends User {
  hasWorkout?: boolean;
  workoutId?: string | null;
  workoutStatus?: 'PENDING' | 'COMPLETED' | null;
  workoutTitle?: string | null;
  workoutBlocks?: WorkoutBlock[] | null;
  studentFeedback?: string | null;
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
  youtubeVideoId?: string;
  blocks: { categoryId: string; description: string }[];
  studentId: string;
  scheduledAt?: string; // ISO 8601 — allows future scheduling
}
