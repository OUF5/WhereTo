'use client';

import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

export interface PixelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const PixelSelect = forwardRef<HTMLSelectElement, PixelSelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block font-pixel text-[10px] text-pixel-primary mb-2 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-3 font-arcade text-lg appearance-none cursor-pointer',
              'bg-pixel-bg-dark text-pixel-text',
              'border-4 border-pixel-muted',
              'focus:border-pixel-primary focus:shadow-glow-cyan',
              'transition-all duration-200',
              error && 'border-pixel-danger focus:border-pixel-danger focus:shadow-glow-red',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Pixel arrow indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-pixel-primary" />
          </div>
        </div>
        {error && (
          <p className="mt-2 font-arcade text-sm text-pixel-danger glow-red">
            ! {error}
          </p>
        )}
      </div>
    );
  }
);

PixelSelect.displayName = 'PixelSelect';

export { PixelSelect };

