import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { WorkoutCategory } from '@dryfit/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<{ categories: WorkoutCategory[] }>('/categories');
      return response;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
