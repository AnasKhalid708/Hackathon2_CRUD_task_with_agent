'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { formatDateTime, isOverdue, isUpcoming } from '@/lib/datetime';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      onDelete(task.id);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        task.completed ? 'opacity-70' : ''
      } ${isOverdue(task.deadline, task.completed) ? 'border-l-4 border-l-red-500' : ''} ${
        isUpcoming(task.deadline) && !task.completed ? 'border-l-4 border-l-yellow-500' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="mt-1 w-5 h-5 text-primary focus:ring-2 focus:ring-primary rounded cursor-pointer"
        />
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          {task.deadline && (
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-1 text-xs rounded ${
                  isOverdue(task.deadline, task.completed)
                    ? 'bg-red-100 text-red-800'
                    : isUpcoming(task.deadline) && !task.completed
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isOverdue(task.deadline, task.completed) && '🔴 Overdue: '}
                {isUpcoming(task.deadline) && !task.completed && '⚠️ Due soon: '}
                {!isOverdue(task.deadline, task.completed) && !isUpcoming(task.deadline) && '📅 '}
                {formatDateTime(task.deadline)}
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
            {task.updated_at !== task.created_at && (
              <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
