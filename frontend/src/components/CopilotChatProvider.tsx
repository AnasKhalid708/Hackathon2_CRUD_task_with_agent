'use client';

import React from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CopilotChatProviderProps {
  children: React.ReactNode;
}

export function CopilotChatProvider({ children }: CopilotChatProviderProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <CopilotKit
      runtimeUrl={`${API_URL}/api/agent/chat`}
      agent="TaskMasterAI"
      properties={{
        user_id: user.id,
      }}
      headers={{
        Authorization: `Bearer ${getToken()}`,
      }}
    >
      {children}
    </CopilotKit>
  );
}
