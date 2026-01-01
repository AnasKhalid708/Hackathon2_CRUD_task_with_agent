'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const authed = isAuthenticated();
    setIsAuthed(authed);
    
    if (!authed) {
      router.push('/signin');
    }
  }, [router]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}
