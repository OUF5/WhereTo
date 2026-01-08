'use client';

import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface PixelTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const PixelTextarea = forwardRef<HTMLTextAreaElement, PixelTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-pixel text-[10px] text-pixel-primary mb-2 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 font-arcade text-lg resize-none',
            'bg-pixel-bg-dark text-pixel-text',
            'border-4 border-pixel-muted',
            'focus:border-pixel-primary focus:shadow-glow-cyan',
            'placeholder:text-pixel-muted/50',
            'transition-all duration-200',
            error && 'border-pixel-danger focus:border-pixel-danger focus:shadow-glow-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 font-arcade text-sm text-pixel-danger glow-red">
            ! {error}
          </p>
        )}
      </div>
    );
  }
);

PixelTextarea.displayName = 'PixelTextarea';

export { PixelTextarea };

