'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  className?: string;
}

export function Header({ title = 'ADVENTURE ROULETTE', showBack = false, backHref = '/', className }: HeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      <div className="flex items-center gap-4">
        {showBack && (
          <Link
            href={backHref}
            className="font-pixel text-xs text-pixel-primary hover:text-pixel-secondary transition-colors"
          >
            {'<'} BACK
          </Link>
        )}
        <h1 className="font-pixel text-sm text-pixel-primary glow-cyan text-center flex-1">
          {title}
        </h1>
        {showBack && <div className="w-12" />} {/* Spacer for centering */}
      </div>
      
      {/* Decorative line */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-pixel-primary to-transparent" />
      </div>
    </header>
  );
}

