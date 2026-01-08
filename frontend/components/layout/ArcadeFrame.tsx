'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ArcadeFrameProps {
  children: ReactNode;
  className?: string;
  showScanlines?: boolean;
}

export function ArcadeFrame({ children, className, showScanlines = true }: ArcadeFrameProps) {
  return (
    <div className="min-h-screen bg-pixel-bg-dark flex items-center justify-center p-4">
      {/* Outer arcade cabinet frame */}
      <div className="w-full max-w-md relative">
        {/* Cabinet top decoration */}
        <div className="flex justify-center mb-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-pixel-danger rounded-full animate-glow-pulse" />
            <div className="w-3 h-3 bg-pixel-gold rounded-full animate-glow-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-3 h-3 bg-pixel-success rounded-full animate-glow-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        {/* CRT Screen container */}
        <div
          className={cn(
            'relative bg-pixel-bg-blue border-8 border-pixel-muted',
            'shadow-[inset_0_0_60px_rgba(0,0,0,0.5),0_0_20px_rgba(0,212,255,0.1)]',
            showScanlines && 'crt-screen',
            className
          )}
        >
          {/* Scanline animation overlay */}
          {showScanlines && <div className="scanline-overlay" />}
          
          {/* Content */}
          <div className="relative z-[1] p-6">
            {children}
          </div>

          {/* Screen reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-[2]" />
        </div>

        {/* Cabinet bottom - coin slot style */}
        <div className="mt-4 flex justify-center">
          <div className="font-pixel text-[8px] text-pixel-muted tracking-widest">
            INSERT COIN TO CONTINUE
          </div>
        </div>
      </div>
    </div>
  );
}

