'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth';
import { ArcadeFrame } from '@/components/layout/ArcadeFrame';
import { Header } from '@/components/layout/Header';
import { PixelButton, PixelCard, PixelAlert } from '@/components/ui';
import { JoinCodeDisplay, MembersList } from '@/components/features';
import { api, ApiError } from '@/lib/api';

interface Member {
  id: string;
  user: { id: string; fullName: string };
  role: string;
  joinedAt: string;
}

function HomeContent() {
  const { user, tenant, logout } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!tenant?.id) return;

      try {
        const data = await api.tenants.members(tenant.id);
        setMembers(data.items);
      } catch (err) {
        const apiErr = err as ApiError;
        setError(apiErr.detail || 'Failed to load members');
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [tenant?.id]);

  return (
    <ArcadeFrame>
      <Header title={tenant?.groupName?.toUpperCase() || 'ADVENTURE ROULETTE'} />

      {/* Welcome message */}
      <div className="text-center mb-6">
        <p className="font-arcade text-xl text-pixel-text">
          Welcome back, <span className="text-pixel-gold">{user?.fullName}</span>!
        </p>
        <p className="font-arcade text-sm text-pixel-muted mt-1">
          Ready for your next adventure?
        </p>
      </div>

      {/* Join Code */}
      {tenant?.joinCode && (
        <div className="mb-8">
          <JoinCodeDisplay code={tenant.joinCode} />
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="space-y-4 mb-8">
        <Link href="/roulette/group" className="block">
          <PixelButton className="w-full" size="lg" variant="primary">
            🎰 ADVENTURE ROULETTE
          </PixelButton>
        </Link>

        <Link href="/suggest" className="block">
          <PixelButton className="w-full" size="lg" variant="secondary">
            📍 SUGGEST A PLACE
          </PixelButton>
        </Link>
      </div>

      {/* Members List */}
      {error && (
        <PixelAlert variant="error" className="mb-4">
          {error}
        </PixelAlert>
      )}

      <PixelCard variant="default" className="mb-6">
        {isLoadingMembers ? (
          <div className="text-center py-4">
            <p className="font-pixel text-xs text-pixel-muted animate-blink">
              LOADING PARTY...
            </p>
          </div>
        ) : (
          <MembersList members={members} />
        )}
      </PixelCard>

      {/* Logout button */}
      <div className="text-center">
        <button
          onClick={logout}
          className="font-pixel text-[10px] text-pixel-danger hover:glow-red transition-all"
        >
          [LOGOUT]
        </button>
      </div>

      {/* Footer decoration */}
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-4 text-pixel-muted">
          <span className="font-pixel text-[8px]">SCORE: {members.length * 100}</span>
          <span className="font-pixel text-[8px]">•</span>
          <span className="font-pixel text-[8px]">LEVEL: 1</span>
        </div>
      </div>
    </ArcadeFrame>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

