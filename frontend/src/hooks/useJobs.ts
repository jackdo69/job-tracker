/**
 * React Query hooks for job applications.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobApplicationsApi } from '../services/api';
import type {
  JobApplication,
  JobApplicationUpdate,
  JobApplicationMove,
} from '@jackdo69/job-tracker-shared-types';

/**
 * Query key factory
 */
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: string) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

/**
 * Get all job applications
 */
export function useJobs() {
  return useQuery({
    queryKey: jobKeys.lists(),
    queryFn: jobApplicationsApi.getAll,
  });
}

/**
 * Get single job application
 */
export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobApplicationsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create job application
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApplicationsApi.create,
    onSuccess: () => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

/**
 * Update job application
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobApplicationUpdate }) =>
      jobApplicationsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
    },
  });
}

/**
 * Delete job application
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApplicationsApi.delete,
    onSuccess: () => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

/**
 * Move job application (for drag-drop)
 */
export function useMoveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JobApplicationMove }) =>
      jobApplicationsApi.move(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobKeys.lists() });

      // Snapshot previous value
      const previousJobs = queryClient.getQueryData(jobKeys.lists());

      // Optimistically update
      queryClient.setQueryData(jobKeys.lists(), (old: JobApplication[] | undefined) => {
        if (!old) return old;
        return old.map((job: JobApplication) =>
          job.id === id
            ? {
                ...job,
                status: data.status,
                orderIndex: data.orderIndex,
                interviewStage: data.interviewStage,
                rejectionStage: data.rejectionStage,
              }
            : job
        );
      });

      return { previousJobs };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
