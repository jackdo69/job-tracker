/**
 * Companies page - List and manage companies.
 */
import { useState } from 'react';
import { useCompanies, useDeleteCompany } from '../../hooks/useCompanies';
import { CompanyFormModal } from '../CompanyForm/CompanyFormModal';
import { type Company } from '@jackdo69/job-tracker-shared-types';

export function CompaniesPage() {
  const { data: companies = [], isLoading, error } = useCompanies();
  const deleteCompanyMutation = useDeleteCompany();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This will not delete your job applications, but they will no longer be linked to this company.`
      )
    ) {
      setDeletingId(id);
      try {
        await deleteCompanyMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete company:', error);
        alert('Failed to delete company. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCloseModal = () => {
    setEditingCompany(null);
    setIsCreateModalOpen(false);
  };

  const getLogoUrl = (logo: string | null) => {
    if (!logo) return null;
    return `${import.meta.env.VITE_API_URL}/api/uploads/company-logos/${logo}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading companies...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="h-12 w-12 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-900 dark:text-white font-medium">
            Failed to load companies
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Companies
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your companies and their logos
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors justify-center sm:justify-start"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Company
        </button>
      </div>

      {/* Empty State */}
      {companies.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No companies yet
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Get started by creating your first company
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your First Company
          </button>
        </div>
      )}

      {/* Companies Grid */}
      {companies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Logo */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-4">
                {company.logo ? (
                  <img
                    src={getLogoUrl(company.logo) || ''}
                    alt={company.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {company.name}
                </h3>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id, company.name)}
                    disabled={deletingId === company.id}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === company.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Form Modal */}
      <CompanyFormModal
        isOpen={isCreateModalOpen || !!editingCompany}
        onClose={handleCloseModal}
        company={editingCompany}
      />
    </div>
  );
}
