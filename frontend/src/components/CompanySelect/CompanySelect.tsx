/**
 * Company select dropdown with search, create new, and logo display.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { useCompanies } from '../../hooks/useCompanies';
import { CompanyFormModal } from '../CompanyForm/CompanyFormModal';

interface CompanySelectProps {
  value: string | null;
  onChange: (companyId: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function CompanySelect({
  value,
  onChange,
  label = 'Company',
  placeholder = 'Select a company...',
  required = false,
}: CompanySelectProps) {
  const { data: companies = [], isLoading } = useCompanies();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected company
  const selectedCompany = companies.find((c) => c.id === value);

  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const term = searchTerm.toLowerCase();
    return companies.filter((company) =>
      company.name.toLowerCase().includes(term)
    );
  }, [companies, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (companyId: string | null) => {
    onChange(companyId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* Selected Company Display / Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2.5 text-base text-left border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedCompany ? (
              <>
                {selectedCompany.logo && (
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="w-6 h-6 rounded object-cover flex-shrink-0"
                  />
                )}
                {!selectedCompany.logo && (
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {selectedCompany.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate">{selectedCompany.name}</span>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                {placeholder}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search companies..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Companies List */}
            <div className="overflow-y-auto max-h-48">
              {isLoading && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading companies...
                </div>
              )}

              {!isLoading && filteredCompanies.length === 0 && !searchTerm && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  No companies yet
                </div>
              )}

              {!isLoading && filteredCompanies.length === 0 && searchTerm && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  No companies found
                </div>
              )}

              {/* Clear Selection Option */}
              {value && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600"
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
                  Clear selection
                </button>
              )}

              {/* Company Options */}
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company.id)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                    company.id === value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate">{company.name}</span>
                </button>
              ))}
            </div>

            {/* Create New Company Option */}
            <div className="border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 font-medium"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create new company
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      <CompanyFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
