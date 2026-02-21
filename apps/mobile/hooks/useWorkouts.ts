import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Workout, User } from '@dryfit/types';

/** Returns YYYY-MM-DD in UTC for a given Date object */
function toUTCDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Student: get workout for a specific date (defaults to today UTC).
 * queryKey includes the date so different dates are cached independently.
 */
export function useActiveWorkout(date?: string) {
  const dateKey = date ?? toUTCDateString(new Date());
  return useQuery({
    queryKey: ['workout', dateKey],
    queryFn: async () => {
      const response = await api.get<{ workout: Workout | null }>(
        `/workouts?date=${dateKey}`
      );
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

// Coach: list students (legacy for non-date specific views)
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

// Coach: list students ordered by whether they have a workout on a specific date
export function useStudentsByDate(date: string) {
  return useQuery({
    queryKey: ['students', date],
    queryFn: async () => {
      const response = await api.get<{ students: (User & { hasWorkout: boolean })[] }>(
        `/workouts/coach/by-date?date=${date}`
      );
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

// Coach: generate a new random invite code
export function useGenerateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ inviteCode: string }>('/users/invite-code', {});
      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update the invite code cache
      queryClient.setQueryData(['inviteCode'], { data: { inviteCode: data.inviteCode } });
    },
  });
}

/**
 * Complete workout mutation.
 * Uses optimistic update to set status = COMPLETED immediately,
 * preventing the UI from flashing "no workout" before the refetch.
 */
export function useCompleteWorkout(dateKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workoutId: string) => {
      const response = await api.patch<Workout>(`/workouts/${workoutId}/complete`, {});
      return response.data;
    },
    onMutate: async (workoutId) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['workout', dateKey] });

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueryData(['workout', dateKey]);

      // Optimistically update the cache
      queryClient.setQueryData(['workout', dateKey], (old: { data: { workout: Workout | null } } | undefined) => {
        if (!old?.data?.workout) return old;
        return {
          ...old,
          data: {
            workout: {
              ...old.data.workout,
              status: 'COMPLETED' as const,
              completedAt: new Date().toISOString(),
            },
          },
        };
      });

      return { previous };
    },
    onError: (_err, _workoutId, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(['workout', dateKey], context.previous);
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['workout', dateKey] });
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
      scheduledAt?: string; // ISO 8601 — allows future scheduling
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', 'coach'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      if (variables.scheduledAt) {
        // Extract YYYY-MM-DD from the scheduledAt to invalidate the specific date
        queryClient.invalidateQueries({ queryKey: ['students', variables.scheduledAt.slice(0, 10)] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['students', toUTCDateString(new Date())] });
      }
    },
  });
}
