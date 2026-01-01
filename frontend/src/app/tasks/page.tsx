'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { Task, TaskCreate, TaskUpdate, FilterType, SortType } from '@/types/task';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';

export default function TasksPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created_desc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, filter, sort, search]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getTasks(user.id, filter, sort, search || undefined);
      setTasks(response.tasks);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskCreate) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await api.createTask(user.id, data);
      setShowForm(false);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: TaskUpdate) => {
    if (!user || !editingTask) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await api.updateTask(user.id, editingTask.id, data);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await api.toggleTaskCompletion(user.id, taskId);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await api.deleteTask(user.id, taskId);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              + New Task
            </button>

            <div className="flex gap-2 items-center">
              <label htmlFor="filter" className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Tasks</option>
                <option value="incomplete">Incomplete</option>
                <option value="complete">Complete</option>
                <option value="overdue">Overdue</option>
                <option value="upcoming">Due Soon (24h)</option>
                <option value="no-deadline">No Deadline</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Sort:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="created_desc">Newest First</option>
                <option value="created_asc">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="status">Status (Incomplete First)</option>
                <option value="deadline_asc">Deadline (Earliest)</option>
                <option value="deadline_desc">Deadline (Latest)</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <TaskList
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              isLoading={isLoading}
            />
          </div>

          {(showForm || editingTask) && (
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleCancelForm}
              isLoading={isSubmitting}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
