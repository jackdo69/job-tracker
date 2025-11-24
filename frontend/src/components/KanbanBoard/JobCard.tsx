/**
 * Draggable job card component.
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JobApplication } from '../../types/job';
import { format } from 'date-fns';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 md:p-4 mb-2 md:mb-3 cursor-move hover:shadow-md transition-shadow touch-manipulation"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white flex-1 min-w-0 break-words">
          {job.position_title}
        </h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1.5 md:p-1 touch-manipulation"
            aria-label="Edit"
          >
            <svg
              className="w-4 h-4 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this application?')) {
                onDelete(job.id);
              }
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1.5 md:p-1 touch-manipulation"
            aria-label="Delete"
          >
            <svg
              className="w-4 h-4 md:w-4 md:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2 truncate">{job.company_name}</p>

      {job.interview_stage && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 truncate">Stage: {job.interview_stage}</p>
      )}

      {job.rejection_stage && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-1 truncate">
          Rejected at: {job.rejection_stage}
        </p>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 gap-2">
        <span className="truncate">{format(new Date(job.application_date), 'MMM d, yyyy')}</span>
        {job.salary_range && <span className="truncate flex-shrink-0">{job.salary_range}</span>}
      </div>

      {job.location && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{job.location}</p>
      )}
    </div>
  );
}
