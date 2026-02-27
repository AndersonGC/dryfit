import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import type { Workout, User, StudentWithWorkout } from '@dryfit/types';

/** Returns YYYY-MM-DD in local time for a given Date object */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Student: get workout for a specific date (defaults to today local).
 * queryKey includes the date so different dates are cached independently.
 */
export function useActiveWorkout(date?: string) {
  const { user } = useAuthStore();
  const dateKey = date ?? toLocalDateString(new Date());
  return useQuery({
    queryKey: ['workout', user?.id, dateKey],
    queryFn: async () => {
      const response = await api.get<{ workout: Workout | null }>(
        `/workouts?date=${dateKey}`
      );
      return response;
    },
    staleTime: 0,
    refetchInterval: 1000 * 15, // Auto-update background every 15s
    retry: 2,
  });
}

// Coach: get all workouts
export function useCoachWorkouts() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['workouts', 'coach', user?.id],
    queryFn: async () => {
      const response = await api.get<{ workouts: Workout[] }>('/workouts');
      return response;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Coach: list students (legacy for non-date specific views)
export function useStudents() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['students', user?.id],
    queryFn: async () => {
      const response = await api.get<{ students: User[] }>('/users/students');
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Coach: list students ordered by whether they have a workout on a specific date
export function useStudentsByDate(date: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['students', user?.id, date],
    queryFn: async () => {
      const response = await api.get<{ students: StudentWithWorkout[] }>(
        `/workouts/coach/by-date?date=${date}`
      );
      return response;
    },
    staleTime: 0,
    refetchInterval: 1000 * 15, // Auto-update background every 15s
  });
}

// Coach: get invite code
export function useInviteCode() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['inviteCode', user?.id],
    queryFn: async () => {
      const response = await api.get<{ inviteCode: string }>('/users/invite-code');
      return response;
    },
    staleTime: Infinity,
  });
}

// Coach: generate a new random invite code
export function useGenerateInviteCode() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ inviteCode: string }>('/users/invite-code', {});
      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update the invite code cache
      if (user?.id) {
        queryClient.setQueryData(['inviteCode', user.id], { data: { inviteCode: data.inviteCode } });
      }
    },
  });
}

/**
 * Complete workout mutation.
 * Uses optimistic update to set status = COMPLETED immediately,
 * preventing the UI from flashing "no workout" before the refetch.
 */
export function useCompleteWorkout(date?: string) {
  const { user } = useAuthStore();
  const dateKey = date ?? toLocalDateString(new Date());
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workoutId, studentFeedback }: { workoutId: string; studentFeedback?: string }) => {
      const response = await api.patch<Workout>(`/workouts/${workoutId}/complete`, {
        studentFeedback,
      });
      return response.data;
    },
    onMutate: async ({ workoutId, studentFeedback }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['workout', user?.id, dateKey] });

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueryData(['workout', user?.id, dateKey]);

      // Optimistically update the cache
      queryClient.setQueryData(['workout', user?.id, dateKey], (old: { data: { workout: Workout | null } } | undefined) => {
        if (!old?.data?.workout) return old;
        return {
          ...old,
          data: {
            workout: {
              ...old.data.workout,
              status: 'COMPLETED' as const,
              completedAt: new Date().toISOString(),
              studentFeedback,
            },
          },
        };
      });

      return { previous };
    },
    onError: (_err, _workoutId, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(['workout', user?.id, dateKey], context.previous);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['workout', user?.id, dateKey] });
    },
  });
}

// Create workout mutation (coach)
export function useCreateWorkout() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      youtubeVideoId?: string;
      blocks: { categoryId: string; description: string }[];
      studentId: string;
      scheduledAt?: string; // ISO 8601 — allows future scheduling
    }) => {
      const response = await api.post<Workout>('/workouts', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'coach', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['students', user?.id] });
      if (variables.scheduledAt) {
        // Extract YYYY-MM-DD from the scheduledAt to invalidate the specific date
        queryClient.invalidateQueries({ queryKey: ['students', user?.id, variables.scheduledAt.slice(0, 10)] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['students', user?.id, toLocalDateString(new Date())] });
      }
    },
  });
}

// Update workout mutation (coach)
export function useUpdateWorkout() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workoutId,
      ...data
    }: {
      workoutId: string;
      title?: string;
      blocks?: { categoryId: string; description: string }[];
      date?: string; // Optional date for invalidation
    }) => {
      // Exclude date from the data sent to the API
      const apiData = { ...data };
      delete apiData.date;
      const response = await api.patch<Workout>(`/workouts/${workoutId}`, apiData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'coach', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['students', user?.id] });
      if (variables.date) {
        queryClient.invalidateQueries({ queryKey: ['students', user?.id, variables.date] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['students', user?.id, toLocalDateString(new Date())] });
      }
    },
  });
}

// Delete workout mutation (coach)
export function useDeleteWorkout() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workoutId, date }: { workoutId: string; date?: string }) => {
      const response = await api.delete(`/workouts/${workoutId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'coach', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['students', user?.id] });
      if (variables.date) {
        queryClient.invalidateQueries({ queryKey: ['students', user?.id, variables.date] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['students', user?.id, toLocalDateString(new Date())] });
      }
    },
  });
}
