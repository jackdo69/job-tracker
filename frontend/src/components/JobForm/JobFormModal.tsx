/**
 * Modal form for creating and editing job applications.
 */
import { useState, useEffect } from 'react';
import { useCreateJob, useUpdateJob } from '../../hooks/useJobs';
import {
  ApplicationStatus,
  type JobApplication,
  type JobApplicationCreate,
} from '@jackdo69/job-tracker-shared-types';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: JobApplication | null;
}

export function JobFormModal({ isOpen, onClose, job }: JobFormModalProps) {
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const isEditing = !!job;

  const [formData, setFormData] = useState({
    companyName: '',
    positionTitle: '',
    status: ApplicationStatus.APPLIED,
    interviewStage: '',
    rejectionStage: '',
    applicationDate: new Date().toISOString().split('T')[0],
    salaryRange: '',
    location: '',
    notes: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (job) {
      setFormData({
        companyName: job.company_name,
        positionTitle: job.position_title,
        status: job.status,
        interviewStage: job.interview_stage || '',
        rejectionStage: job.rejection_stage || '',
        applicationDate: job.application_date.split('T')[0],
        salaryRange: job.salary_range || '',
        location: job.location || '',
        notes: job.notes || '',
      });
    } else {
      // Reset form for new job
      setFormData({
        companyName: '',
        positionTitle: '',
        status: ApplicationStatus.APPLIED,
        interviewStage: '',
        rejectionStage: '',
        applicationDate: new Date().toISOString().split('T')[0],
        salaryRange: '',
        location: '',
        notes: '',
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate and format application date
    let applicationDate: string;
    try {
      const date = new Date(formData.applicationDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      applicationDate = date.toISOString();
    } catch (error) {
      console.error('Invalid application date:', formData.applicationDate);
      alert('Please provide a valid application date');
      return;
    }

    const data: JobApplicationCreate = {
      company_name: formData.companyName,
      position_title: formData.positionTitle,
      status: formData.status,
      interview_stage: formData.interviewStage || null,
      rejection_stage: formData.rejectionStage || null,
      application_date: applicationDate,
      salary_range: formData.salaryRange || null,
      location: formData.location || null,
      notes: formData.notes || null,
    };

    try {
      if (isEditing && job) {
        await updateJobMutation.mutateAsync({ id: job.id, data });
      } else {
        await createJobMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Application' : 'New Application'}
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
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Position Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.positionTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, positionTitle: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ApplicationStatus,
                    })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ApplicationStatus.APPLIED}>Applied</option>
                  <option value={ApplicationStatus.INTERVIEWING}>
                    Interviewing
                  </option>
                  <option value={ApplicationStatus.OFFER}>Offer</option>
                  <option value={ApplicationStatus.REJECTED}>Rejected</option>
                </select>
              </div>

              {/* Interview Stage (conditional) */}
              {formData.status === ApplicationStatus.INTERVIEWING && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interview Stage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Phone Screen, Technical Round 1"
                    value={formData.interviewStage}
                    onChange={(e) =>
                      setFormData({ ...formData, interviewStage: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Rejection Stage (conditional) */}
              {formData.status === ApplicationStatus.REJECTED && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rejection Stage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., After Phone Screen, After Onsite"
                    value={formData.rejectionStage}
                    onChange={(e) =>
                      setFormData({ ...formData, rejectionStage: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Application Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Application Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.applicationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, applicationDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  placeholder="e.g., $120k-$150k"
                  value={formData.salaryRange}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryRange: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco, CA (Remote)"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Add any notes about this application..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
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
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
                className="w-full sm:w-auto px-4 py-2.5 text-base text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors touch-manipulation"
              >
                {createJobMutation.isPending || updateJobMutation.isPending
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
