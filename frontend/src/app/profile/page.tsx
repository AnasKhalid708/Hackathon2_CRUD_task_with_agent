'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { User, Mail, Lock, ShieldAlert, ArrowLeft, LogOut, Save, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setIsLoadingProfile(true);
      const profile = await api.getProfile(user.id);
      setEmail(profile.email);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !currentPassword) {
      setError('Email and current password are required');
      return;
    }

    try {
      setIsUpdatingEmail(true);
      await api.updateProfile(user.id, { email: email.trim(), current_password: currentPassword });
      setSuccessMessage('Email updated successfully');
      setCurrentPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.changePassword(user.id, { current_password: currentPassword, new_password: newPassword });
      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !deletePassword) return;

    setError(null);
    setSuccessMessage(null);

    try {
      setIsDeletingAccount(true);
      await api.deleteAccount(user.id, deletePassword);
      alert('Account deleted successfully');
      logout();
      router.push('/signin');
    } catch (err) {
      setError(getErrorMessage(err));
      setIsDeletingAccount(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden pb-20">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/tasks')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Profile Settings
                </h1>
              </div>
              <Button variant="destructive" size="sm" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle>Chat Preference</CardTitle>
                    </div>
                    <CardDescription>Choose which chat interface you prefer to use.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      onClick={() => setChatType('custom')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        chatType === 'custom' 
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${chatType === 'custom' ? 'bg-primary/20' : 'bg-slate-700/50'}`}>
                          <Mic className={`w-6 h-6 ${chatType === 'custom' ? 'text-primary' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${chatType === 'custom' ? 'text-primary' : 'text-slate-200'}`}>
                              Custom Chat with Voice
                            </h3>
                            {chatType === 'custom' && (
                              <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">Active</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            Use our custom chat interface with voice recognition support. Perfect for hands-free task management.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => setChatType('default')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        chatType === 'default' 
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${chatType === 'default' ? 'bg-primary/20' : 'bg-slate-700/50'}`}>
                          <MessageSquare className={`w-6 h-6 ${chatType === 'default' ? 'text-primary' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${chatType === 'default' ? 'text-primary' : 'text-slate-200'}`}>
                              Default CopilotKit Chat
                            </h3>
                            {chatType === 'default' && (
                              <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full">Active</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            Use the standard CopilotKit popup interface with text-based interactions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle>Update Email</CardTitle>
                    </div>
                    <CardDescription>Change your email address associated with this account.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isUpdatingEmail}
                          icon={<User className="w-4 h-4" />}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Current Password</label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={isUpdatingEmail}
                          placeholder="Required to change email"
                          icon={<Lock className="w-4 h-4" />}
                        />
                      </div>
                      <Button type="submit" disabled={isUpdatingEmail} className="w-full gap-2">
                        {isUpdatingEmail ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle>Change Password</CardTitle>
                    </div>
                    <CardDescription>Ensure your account is secure with a strong password.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Current Password</label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={isChangingPassword}
                          icon={<Lock className="w-4 h-4" />}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isChangingPassword}
                          placeholder="Min 8 characters"
                          icon={<Lock className="w-4 h-4" />}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isChangingPassword}
                          icon={<Lock className="w-4 h-4" />}
                        />
                      </div>
                      <Button type="submit" disabled={isChangingPassword} className="w-full gap-2">
                        {isChangingPassword ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-destructive" />
                      </div>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    </div>
                    <CardDescription>
                      Once you delete your account, there is no going back. All your tasks will be permanently deleted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showDeleteConfirm ? (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-destructive">
                            Enter your password to confirm deletion
                          </label>
                          <Input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            disabled={isDeletingAccount}
                            className="border-destructive/30 focus:border-destructive"
                            icon={<Lock className="w-4 h-4 text-destructive" />}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword || isDeletingAccount}
                            className="flex-1 gap-2"
                          >
                            {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword('');
                            }}
                            disabled={isDeletingAccount}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
