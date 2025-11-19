/**
 * React Query hooks for analytics.
 */
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

/**
 * Query key factory
 */
export const analyticsKeys = {
  all: ['analytics'] as const,
  data: () => [...analyticsKeys.all, 'data'] as const,
};

/**
 * Get analytics data
 */
export function useAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.data(),
    queryFn: analyticsApi.get,
  });
}
