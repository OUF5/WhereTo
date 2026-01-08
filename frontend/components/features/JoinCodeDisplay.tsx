'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface JoinCodeDisplayProps {
  code: string;
  className?: string;
}

export function JoinCodeDisplay({ code, className }: JoinCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('text-center', className)}>
      <p className="font-pixel text-[10px] text-pixel-muted mb-2 uppercase">
        INVITE CODE
      </p>
      
      <button
        onClick={handleCopy}
        className={cn(
          'group relative px-6 py-3 bg-pixel-bg-dark border-4 transition-all duration-200',
          copied
            ? 'border-pixel-success shadow-glow-green'
            : 'border-pixel-primary hover:shadow-glow-cyan'
        )}
        title="Click to copy"
      >
        {/* Code display */}
        <span
          className={cn(
            'font-pixel text-lg tracking-[0.3em] transition-colors',
            copied ? 'text-pixel-success glow-green' : 'text-pixel-primary glow-cyan'
          )}
        >
          {code}
        </span>

        {/* Copy indicator */}
        <span
          className={cn(
            'absolute -bottom-6 left-1/2 -translate-x-1/2',
            'font-arcade text-sm transition-opacity',
            copied ? 'opacity-100 text-pixel-success' : 'opacity-0 group-hover:opacity-100 text-pixel-muted'
          )}
        >
          {copied ? '✓ COPIED!' : 'CLICK TO COPY'}
        </span>
      </button>
    </div>
  );
}

