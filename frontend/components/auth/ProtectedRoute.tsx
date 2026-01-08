'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArcadeFrame } from '@/components/layout/ArcadeFrame';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <ArcadeFrame>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="font-pixel text-sm text-pixel-primary animate-blink">
            LOADING...
          </div>
          <div className="mt-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-pixel-primary"
                style={{
                  animation: `blink 1s step-end infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </ArcadeFrame>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

