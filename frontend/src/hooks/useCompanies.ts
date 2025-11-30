/**
 * React Query hooks for companies.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../services/api';
import { jobKeys } from './useJobs';

/**
 * Query key factory
 */
export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (filters: string) => [...companyKeys.lists(), { filters }] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

/**
 * Get all companies for current user
 */
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: companiesApi.getAll,
  });
}

/**
 * Get single company by ID
 */
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create company with optional logo
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, logoFile }: { name: string; logoFile?: File }) =>
      companiesApi.create(name, logoFile),
    onSuccess: () => {
      // Invalidate companies list
      void queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Update company name and/or logo
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      logoFile,
    }: {
      id: string;
      name?: string;
      logoFile?: File;
    }) => companiesApi.update(id, name, logoFile),
    onSuccess: (_, variables) => {
      // Invalidate companies list and detail
      void queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) });
      // Also invalidate jobs list since job applications include company data
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

/**
 * Delete company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companiesApi.delete,
    onSuccess: () => {
      // Invalidate companies list
      void queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      // Also invalidate jobs list since job applications may reference this company
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
