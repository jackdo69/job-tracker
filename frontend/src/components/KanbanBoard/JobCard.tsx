/**
 * Draggable job card component.
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { JobApplication } from '@jackdo69/job-tracker-shared-types';
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

  const handleClick = () => {
    if (!isDragging) {
      onEdit(job);
    }
  };

  // Get company logo from linked company (logo is already a full URL from Supabase Storage)
  const companyLogo = job.company?.logo || null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="group bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 md:p-4 mb-2 md:mb-3 cursor-pointer hover:brightness-105 dark:hover:brightness-110 hover:shadow-md transition-all touch-manipulation relative"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white flex-1 min-w-0 break-words">
          {job.positionTitle}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this application?')) {
              onDelete(job.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1.5 md:p-1 touch-manipulation flex-shrink-0"
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

      <div className="flex items-center gap-2 mb-2">
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={job.companyName}
            className="w-5 h-5 md:w-6 md:h-6 rounded object-cover flex-shrink-0"
          />
        ) : (
          job.company && (
            <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {job.companyName.charAt(0).toUpperCase()}
            </div>
          )
        )}
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate">
          {job.companyName}
        </p>
      </div>

      {job.interviewStage && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 truncate">Stage: {job.interviewStage}</p>
      )}

      {job.rejectionStage && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-1 truncate">
          Rejected at: {job.rejectionStage}
        </p>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 gap-2">
        <span className="truncate">
          {job.applicationDate
            ? (() => {
                try {
                  const date = new Date(job.applicationDate);
                  return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy');
                } catch {
                  return 'Invalid date';
                }
              })()
            : 'No date'
          }
        </span>
        {job.salaryRange && <span className="truncate flex-shrink-0">{job.salaryRange}</span>}
      </div>

      {job.location && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{job.location}</p>
      )}
    </div>
  );
}
