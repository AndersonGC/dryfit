import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '@dryfit/types';

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get<{ students: User[] }>('/users/students');
      return response.data.students;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInviteCode() {
  return useQuery({
    queryKey: ['invite-code'],
    queryFn: async (): Promise<string> => {
      const response = await api.get<{ inviteCode: string }>('/users/invite-code');
      return response.data.inviteCode;
    },
    staleTime: Infinity, // invite code never changes
  });
}
