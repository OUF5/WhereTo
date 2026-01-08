'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-pixel text-[10px] text-pixel-primary mb-2 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 font-arcade text-lg',
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

PixelInput.displayName = 'PixelInput';

export { PixelInput };

