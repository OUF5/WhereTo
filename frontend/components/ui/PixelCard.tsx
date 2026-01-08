'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlight' | 'danger';
  glow?: boolean;
}

const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant = 'default', glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'border-pixel-muted bg-pixel-bg-blue/50',
      highlight: 'border-pixel-primary bg-pixel-bg-blue',
      danger: 'border-pixel-danger bg-pixel-danger/10',
    };

    const glowStyles = {
      default: '',
      highlight: glow ? 'shadow-glow-cyan' : '',
      danger: glow ? 'shadow-glow-red' : '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border-4 p-6',
          'transition-all duration-200',
          variants[variant],
          glowStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PixelCard.displayName = 'PixelCard';

export { PixelCard };

