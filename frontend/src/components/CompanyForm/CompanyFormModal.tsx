/**
 * Modal form for creating and editing companies.
 */
import { useState, useEffect, useRef } from 'react';
import { useCreateCompany, useUpdateCompany } from '../../hooks/useCompanies';
import { type Company } from '@jackdo69/job-tracker-shared-types';

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function CompanyFormModal({
  isOpen,
  onClose,
  company,
}: CompanyFormModalProps) {
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const isEditing = !!company;

  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (company) {
      setName(company.name);
      // Show existing logo if available (logo is already a full URL from Supabase Storage)
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    } else {
      // Reset form for new company
      setName('');
      setLogoFile(null);
      setLogoPreview(null);
      setFileError(null);
    }
  }, [company]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Please upload a JPEG, PNG, or WebP image');
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Image must be smaller than 5MB');
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      if (isEditing && company) {
        await updateCompanyMutation.mutateAsync({
          id: company.id,
          name: name.trim(),
          logoFile: logoFile || undefined,
        });
      } else {
        await createCompanyMutation.mutateAsync({
          name: name.trim(),
          logoFile: logoFile || undefined,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Company' : 'New Company'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 touch-manipulation"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Google, Microsoft, Apple"
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Logo
                </label>
                <div className="space-y-2">
                  {/* Preview */}
                  {logoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        aria-label="Remove logo"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                  />

                  {/* File Error */}
                  {fileError && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {fileError}
                    </p>
                  )}

                  {/* Help Text */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPEG, PNG, or WebP. Max size: 5MB. Will be resized to
                    200x200px.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createCompanyMutation.isPending ||
                  updateCompanyMutation.isPending ||
                  !name.trim()
                }
                className="w-full sm:w-auto px-4 py-2.5 text-base text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors touch-manipulation"
              >
                {createCompanyMutation.isPending ||
                updateCompanyMutation.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update'
                  : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
