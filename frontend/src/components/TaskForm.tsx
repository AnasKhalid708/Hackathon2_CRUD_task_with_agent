'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate } from '@/types/task';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      if (task.deadline) {
        const date = new Date(task.deadline);
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDeadline(localDateTime);
      }
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length > 200) {
      setError('Title must be less than 200 characters');
      return;
    }

    if (description.trim().length > 1000) {
      setError('Description must be less than 1000 characters');
      return;
    }

    const submitData: TaskCreate | TaskUpdate = {
      title: title.trim(),
      description: description.trim() || '',
    };

    if (deadline) {
      submitData.deadline = new Date(deadline).toISOString();
    } else {
      submitData.deadline = null;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">{task ? 'Edit Task' : 'Create New Task'}</h2>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter task title"
              maxLength={200}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter task description (optional)"
              rows={4}
              maxLength={1000}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
              Deadline (optional)
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            {deadline && (
              <button
                type="button"
                onClick={() => setDeadline('')}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                disabled={isLoading}
              >
                Clear deadline
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
