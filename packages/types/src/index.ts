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

export interface Workout {
  id: string;
  title: string;
  description?: string | null;
  youtubeVideoId?: string | null;
  type: WorkoutType;
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
  description?: string;
  youtubeVideoId?: string;
  type: WorkoutType;
  studentId: string;
  scheduledAt?: string; // ISO 8601 — allows future scheduling
}
