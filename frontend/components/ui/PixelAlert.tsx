'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface PixelAlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
}

const PixelAlert = forwardRef<HTMLDivElement, PixelAlertProps>(
  ({ className, variant = 'info', title, children, onClose, ...props }, ref) => {
    const variants = {
      error: {
        container: 'border-pixel-danger bg-pixel-danger/10',
        title: 'text-pixel-danger glow-red',
        icon: '✕',
      },
      success: {
        container: 'border-pixel-success bg-pixel-success/10',
        title: 'text-pixel-success glow-green',
        icon: '✓',
      },
      warning: {
        container: 'border-pixel-secondary bg-pixel-secondary/10',
        title: 'text-pixel-secondary',
        icon: '!',
      },
      info: {
        container: 'border-pixel-primary bg-pixel-primary/10',
        title: 'text-pixel-primary glow-cyan',
        icon: '?',
      },
    };

    const defaultTitles = {
      error: 'GAME OVER',
      success: 'SUCCESS',
      warning: 'WARNING',
      info: 'INFO',
    };

    const config = variants[variant];
    const displayTitle = title || defaultTitles[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'border-4 p-4 relative',
          config.container,
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Pixel icon */}
          <span className={cn('font-pixel text-lg', config.title)}>
            [{config.icon}]
          </span>
          
          <div className="flex-1">
            <h4 className={cn('font-pixel text-xs uppercase tracking-wider mb-1', config.title)}>
              {displayTitle}
            </h4>
            <div className="font-arcade text-lg text-pixel-text">
              {children}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                'font-pixel text-xs hover:opacity-70 transition-opacity',
                config.title
              )}
              aria-label="Close alert"
            >
              [X]
            </button>
          )}
        </div>
      </div>
    );
  }
);

PixelAlert.displayName = 'PixelAlert';

export { PixelAlert };

