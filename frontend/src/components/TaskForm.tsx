'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate, RecurringPattern } from '@/types/task';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Save, Calendar, Clock, Repeat, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(2);
  const [recurringTime, setRecurringTime] = useState('14:00');

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
      if (task.recurring) {
        setIsRecurring(true);
        setRecurringType(task.recurring.type);
        if (task.recurring.day_of_week !== undefined) {
          setDayOfWeek(task.recurring.day_of_week);
        }
        if (task.recurring.time) {
          setRecurringTime(task.recurring.time);
        }
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

    if (isRecurring) {
      const recurring: RecurringPattern = {
        type: recurringType,
        time: recurringTime,
      };

      if (recurringType === 'weekly') {
        recurring.day_of_week = dayOfWeek;
      }

      submitData.recurring = recurring;
    } else {
      submitData.recurring = null;
    }

    onSubmit(submitData);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative my-8 max-h-[90vh] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}
      >
        {/* Background Gradient Blob */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {task ? '✏️ Edit Task' : '✨ New Task'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-300">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                maxLength={200}
                disabled={isLoading}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-primary/50"
              />
              <p className="text-xs text-slate-500 text-right">{title.length}/200</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-slate-500 resize-none transition-all min-h-[100px]"
                placeholder="Add details..."
                maxLength={1000}
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 text-right">{description.length}/1000</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Deadline
                </label>
                <div className="flex gap-2">
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-800/50 border-slate-700 text-white [color-scheme:dark]"
                  />
                  {deadline && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeadline('')}
                      className="text-slate-400 hover:text-white"
                      title="Clear deadline"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="peer sr-only"
                    disabled={isLoading}
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex items-center gap-2">
                  <Repeat className="w-4 h-4" /> Recurring Task
                </span>
              </label>
            </div>

            <AnimatePresence>
              {isRecurring && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-white/5 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">Frequency</label>
                      <select
                        value={recurringType}
                        onChange={(e) => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                        disabled={isLoading}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">Time</label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="time"
                          value={recurringTime}
                          onChange={(e) => setRecurringTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:ring-1 focus:ring-primary outline-none [color-scheme:dark]"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {recurringType === 'weekly' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">Day of Week</label>
                      <div className="flex flex-wrap gap-1">
                        {days.map((day, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => setDayOfWeek(index)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${dayOfWeek === index
                                ? 'bg-primary text-white'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                              }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {task ? 'Update Task' : 'Create Task'}
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
