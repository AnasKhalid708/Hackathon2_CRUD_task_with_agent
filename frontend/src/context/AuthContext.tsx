'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { getUser, setUser, setToken, logout as authLogout, isAuthenticated } from '@/lib/auth';
import { SignupData, SigninData } from '@/types/user';

interface AuthContextType {
  user: { id: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (data: SignupData) => Promise<void>;
  signin: (data: SigninData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser && isAuthenticated()) {
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      setIsLoading(true);
      await api.signup(data);
      await signin(data);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (data: SigninData) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await api.signin(data);
      setToken(response.access_token);
      setUser(response.user);
      setUserState(response.user);
      router.push('/tasks');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setUserState(null);
    router.push('/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signup,
        signin,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
