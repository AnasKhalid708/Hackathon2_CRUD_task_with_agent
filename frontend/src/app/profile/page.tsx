'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/tasks')}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  Back to Tasks
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

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-md">
              {successMessage}
            </div>
          )}

          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Update Email</h2>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={isUpdatingEmail}
                    />
                  </div>
                  <div>
                    <label htmlFor="current-password-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password (required to change email)
                    </label>
                    <input
                      id="current-password-email"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={isUpdatingEmail}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="current-password-change" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      id="current-password-change"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (min 8 characters)
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      minLength={8}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      minLength={8}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. All your tasks will be permanently deleted.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter your password to confirm deletion
                      </label>
                      <input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                        disabled={isDeletingAccount}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={!deletePassword || isDeletingAccount}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                        }}
                        disabled={isDeletingAccount}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
