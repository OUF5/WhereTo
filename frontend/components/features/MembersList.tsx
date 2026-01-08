'use client';

import { cn } from '@/lib/utils';

interface Member {
  id: string;
  user: { id: string; fullName: string };
  role: string;
  joinedAt: string;
}

interface MembersListProps {
  members: Member[];
  className?: string;
}

// Pixel avatar colors based on role
const AVATAR_COLORS = [
  'bg-pixel-primary',
  'bg-pixel-secondary',
  'bg-pixel-success',
  'bg-pixel-gold',
];

export function MembersList({ members, className }: MembersListProps) {
  return (
    <div className={cn('', className)}>
      <h3 className="font-pixel text-[10px] text-pixel-muted mb-3 uppercase">
        PARTY MEMBERS ({members.length})
      </h3>

      <div className="space-y-2">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2 bg-pixel-bg-dark/50 border-2 border-pixel-muted/30"
          >
            {/* Pixel avatar */}
            <div
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                AVATAR_COLORS[index % AVATAR_COLORS.length]
              )}
            >
              <span className="font-pixel text-[10px] text-pixel-bg-dark">
                {member.user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Name and role */}
            <div className="flex-1 min-w-0">
              <p className="font-arcade text-lg text-pixel-text truncate">
                {member.user.fullName}
              </p>
            </div>

            {/* Role badge */}
            <span
              className={cn(
                'font-pixel text-[8px] px-2 py-1',
                member.role === 'OWNER'
                  ? 'bg-pixel-gold text-pixel-bg-dark'
                  : 'bg-pixel-muted/30 text-pixel-muted'
              )}
            >
              {member.role === 'OWNER' ? '👑 OWNER' : 'MEMBER'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

