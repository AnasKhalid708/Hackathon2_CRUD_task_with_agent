'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { Task, TaskCreate, TaskUpdate, FilterType, SortType } from '@/types/task';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { CopilotChat } from '@/components/CopilotChat';
import { checkRecurringTaskNotifications, requestNotificationPermission } from '@/lib/notifications';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Filter, ArrowUpDown, LogOut, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      requestNotificationPermission();

      const notificationInterval = setInterval(() => {
        if (tasks.length > 0) {
          checkRecurringTaskNotifications(tasks);
        }
      }, 60000);

      return () => clearInterval(notificationInterval);
    }
  }, [user, filter, sort, search]);

  useEffect(() => {
    if (tasks.length > 0) {
      checkRecurringTaskNotifications(tasks);
    }
  }, [tasks]);

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
      setError(null);
      await api.toggleTaskCompletion(user.id, taskId);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      setError(null);
      await api.deleteTask(user.id, taskId);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSubmitTask = async (data: TaskCreate | TaskUpdate) => {
    if (editingTask) {
      await handleUpdateTask(data);
    } else {
      await handleCreateTask(data as TaskCreate);
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
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-secondary p-2.5 rounded-xl shadow-lg shadow-primary/20">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  TaskMaster
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-slate-300">{user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/profile'}
                  className="hidden sm:flex"
                >
                  Profile
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-[200px] relative group"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-800 focus:bg-slate-900 transition-all"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-3 items-center"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800 hover:border-primary/50 hover:bg-slate-900/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <Filter className="w-4 h-4 text-slate-500 ml-2 group-hover:text-primary transition-colors" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer py-1.5 pr-8 pl-2 hover:text-white transition-colors"
                >
                  <option value="all">All Tasks</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Complete</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Due Soon</option>
                  <option value="no-deadline">No Deadline</option>
                </select>
                {filter !== 'all' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50"
                  />
                )}
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800 hover:border-primary/50 hover:bg-slate-900/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <ArrowUpDown className="w-4 h-4 text-slate-500 ml-2 group-hover:text-primary transition-colors" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer py-1.5 pr-8 pl-2 hover:text-white transition-colors"
                >
                  <option value="created_desc">Newest</option>
                  <option value="created_asc">Oldest</option>
                  <option value="title_asc">A-Z</option>
                  <option value="title_desc">Z-A</option>
                  <option value="status">Status</option>
                  <option value="deadline_asc">Deadline (Earliest)</option>
                  <option value="deadline_desc">Deadline (Latest)</option>
                </select>
                {sort !== 'created_desc' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50"
                  />
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  <motion.div
                    animate={{ rotate: showForm ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                  New Task
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative min-h-[400px]">
            <TaskList
              tasks={tasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              isLoading={isLoading}
            />
          </div>

          <AnimatePresence>
            {(showForm || editingTask) && (
              <TaskForm
                task={editingTask}
                onSubmit={handleSubmitTask}
                onCancel={handleCancelForm}
                isLoading={isSubmitting}
              />
            )}
          </AnimatePresence>
        </main>

        <CopilotChat />
      </div>
    </ProtectedRoute>
  );
}
