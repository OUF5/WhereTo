'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      font-pixel uppercase tracking-wider
      border-4 transition-all duration-100
      active:translate-x-1 active:translate-y-1 active:shadow-none
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
    `;

    const variants = {
      primary: `
        bg-pixel-primary text-pixel-bg-dark border-pixel-primary
        shadow-[4px_4px_0_0_#006680]
        hover:bg-[#00b8e6] hover:shadow-[6px_6px_0_0_#006680]
      `,
      secondary: `
        bg-pixel-secondary text-pixel-bg-dark border-pixel-secondary
        shadow-[4px_4px_0_0_#994020]
        hover:bg-[#ff7f4d] hover:shadow-[6px_6px_0_0_#994020]
      `,
      danger: `
        bg-pixel-danger text-white border-pixel-danger
        shadow-[4px_4px_0_0_#990422]
        hover:bg-[#ff2952] hover:shadow-[6px_6px_0_0_#990422]
      `,
      success: `
        bg-pixel-success text-pixel-bg-dark border-pixel-success
        shadow-[4px_4px_0_0_#1f990a]
        hover:bg-[#4dff33] hover:shadow-[6px_6px_0_0_#1f990a]
      `,
      ghost: `
        bg-transparent text-pixel-primary border-pixel-primary
        shadow-[4px_4px_0_0_#00d4ff40]
        hover:bg-pixel-primary/10 hover:shadow-[6px_6px_0_0_#00d4ff60]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1 text-[10px]',
      md: 'px-6 py-2 text-xs',
      lg: 'px-8 py-3 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-blink">...</span>
            <span>LOADING</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';

export { PixelButton };

