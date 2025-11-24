/**
 * Main Kanban board component with drag-and-drop.
 */
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useJobs, useMoveJob, useDeleteJob } from '../../hooks/useJobs';
import { ApplicationStatus, type JobApplication } from '../../types/job';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';

interface KanbanBoardProps {
  onEdit: (job: JobApplication) => void;
}

export function KanbanBoard({ onEdit }: KanbanBoardProps) {
  const { data: jobs = [], isLoading } = useJobs();
  const moveJobMutation = useMoveJob();
  const deleteJobMutation = useDeleteJob();
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group jobs by status
  const jobsByStatus = {
    [ApplicationStatus.APPLIED]: jobs
      .filter((job) => job.status === ApplicationStatus.APPLIED)
      .sort((a, b) => a.order_index - b.order_index),
    [ApplicationStatus.INTERVIEWING]: jobs
      .filter((job) => job.status === ApplicationStatus.INTERVIEWING)
      .sort((a, b) => a.order_index - b.order_index),
    [ApplicationStatus.OFFER]: jobs
      .filter((job) => job.status === ApplicationStatus.OFFER)
      .sort((a, b) => a.order_index - b.order_index),
    [ApplicationStatus.REJECTED]: jobs
      .filter((job) => job.status === ApplicationStatus.REJECTED)
      .sort((a, b) => a.order_index - b.order_index),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) {
      setActiveJob(job);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    const activeJob = jobs.find((j) => j.id === active.id);
    if (!activeJob) return;

    // Determine the new status
    const overStatus = over.id as ApplicationStatus;
    const oldStatus = activeJob.status;

    // Get the jobs in the target column
    const targetJobs = jobsByStatus[overStatus];

    // Find the position in the new column
    const overIndex = targetJobs.findIndex((j) => j.id === over.id);
    let newOrderIndex = 0;

    if (overIndex !== -1) {
      newOrderIndex = targetJobs[overIndex].order_index;
    } else if (targetJobs.length > 0) {
      // Dropped at the end of the column
      newOrderIndex = Math.max(...targetJobs.map((j) => j.order_index)) + 1;
    }

    // Only update if status or position changed
    if (oldStatus !== overStatus || activeJob.order_index !== newOrderIndex) {
      moveJobMutation.mutate({
        id: activeJob.id,
        data: {
          status: overStatus,
          order_index: newOrderIndex,
          interview_stage:
            overStatus === ApplicationStatus.INTERVIEWING
              ? activeJob.interview_stage || 'Initial'
              : null,
          rejection_stage:
            overStatus === ApplicationStatus.REJECTED
              ? activeJob.rejection_stage || 'Unknown'
              : null,
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteJobMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading applications...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Desktop: Horizontal Scroll | Mobile: Vertical Stack */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:overflow-x-auto pb-4">
        <KanbanColumn
          status={ApplicationStatus.APPLIED}
          jobs={jobsByStatus[ApplicationStatus.APPLIED]}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
        <KanbanColumn
          status={ApplicationStatus.INTERVIEWING}
          jobs={jobsByStatus[ApplicationStatus.INTERVIEWING]}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
        <KanbanColumn
          status={ApplicationStatus.OFFER}
          jobs={jobsByStatus[ApplicationStatus.OFFER]}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
        <KanbanColumn
          status={ApplicationStatus.REJECTED}
          jobs={jobsByStatus[ApplicationStatus.REJECTED]}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="rotate-3">
            <JobCard job={activeJob} onEdit={onEdit} onDelete={handleDelete} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
