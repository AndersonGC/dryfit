import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Workout, User } from '@dryfit/types';

// Student: get active workout
export function useActiveWorkout() {
  return useQuery({
    queryKey: ['workout', 'active'],
    queryFn: async () => {
      const response = await api.get<{ workout: Workout | null }>('/workouts');
      return response;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

// Coach: get all workouts
export function useCoachWorkouts() {
  return useQuery({
    queryKey: ['workouts', 'coach'],
    queryFn: async () => {
      const response = await api.get<{ workouts: Workout[] }>('/workouts');
      return response;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Coach: list students
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get<{ students: User[] }>('/users/students');
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Coach: get invite code
export function useInviteCode() {
  return useQuery({
    queryKey: ['inviteCode'],
    queryFn: async () => {
      const response = await api.get<{ inviteCode: string }>('/users/invite-code');
      return response;
    },
    staleTime: Infinity,
  });
}

// Complete workout mutation
export function useCompleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workoutId: string) => {
      const response = await api.patch<Workout>(`/workouts/${workoutId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', 'active'] });
    },
  });
}

// Create workout mutation (coach)
export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      type: 'STRENGTH' | 'WOD' | 'HIIT' | 'CUSTOM';
      studentId: string;
      exercises: Array<{
        name: string;
        sets?: number;
        reps?: string;
        weight?: string;
        order: number;
      }>;
    }) => {
      const response = await api.post<Workout>('/workouts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'coach'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
