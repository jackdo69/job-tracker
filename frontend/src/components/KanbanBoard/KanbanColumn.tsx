/**
 * Kanban column for a specific status.
 */
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { JobApplication, ApplicationStatus } from '@jackdo69/job-tracker-shared-types';
import { JobCard } from './JobCard';

interface KanbanColumnProps {
  status: ApplicationStatus;
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  Applied: {
    title: 'Applied',
    color: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
  Interviewing: {
    title: 'Interviewing',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  Offer: {
    title: 'Offer',
    color: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-300 dark:border-green-700',
  },
  Rejected: {
    title: 'Rejected',
    color: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
  },
  Cancelled: {
    title: 'Cancelled',
    color: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
};

export function KanbanColumn({ status, jobs, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = statusConfig[status];
  const jobIds = jobs.map((job) => job.id);

  return (
    <div
      ref={setNodeRef}
      className={`w-full md:flex-1 md:min-w-0 ${config.color} rounded-lg p-2 md:p-3 ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <h2 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate">{config.title}</h2>
        <span className="bg-white dark:bg-gray-700 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 ml-1">
          {jobs.length}
        </span>
      </div>

      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {jobs.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
              No applications yet
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
