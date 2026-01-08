'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SpinWheelProps {
  isSpinning: boolean;
  items: string[];
  onSpinComplete?: () => void;
}

export function SpinWheel({ isSpinning, items, onSpinComplete }: SpinWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    if (!isSpinning) {
      setSpeed(50);
      return;
    }

    // Spinning animation - cycles through items
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(items.length, 1));
    }, speed);

    // Gradually slow down
    const slowDown = setInterval(() => {
      setSpeed((prev) => {
        const newSpeed = prev + 20;
        if (newSpeed > 400) {
          clearInterval(slowDown);
          clearInterval(interval);
          onSpinComplete?.();
          return prev;
        }
        return newSpeed;
      });
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(slowDown);
    };
  }, [isSpinning, items.length, onSpinComplete]);

  const displayItems = items.length > 0 ? items : ['???'];
  const displayItem = displayItems[currentIndex % displayItems.length];

  return (
    <div className="relative">
      {/* Decorative frame */}
      <div className="absolute -inset-4 border-4 border-pixel-gold/30 pointer-events-none" />
      <div className="absolute -inset-2 border-2 border-pixel-primary/50 pointer-events-none" />

      {/* Main display */}
      <div
        className={cn(
          'bg-pixel-bg-dark border-4 p-8 text-center transition-all',
          isSpinning
            ? 'border-pixel-gold shadow-glow-gold'
            : 'border-pixel-primary'
        )}
      >
        {/* Slot machine style display */}
        <div className="relative overflow-hidden py-4">
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-pixel-bg-dark to-transparent z-10" />
          
          {/* Display text */}
          <div
            className={cn(
              'font-arcade text-2xl transition-all min-h-[60px] flex items-center justify-center',
              isSpinning
                ? 'text-pixel-gold animate-pulse'
                : 'text-pixel-primary'
            )}
          >
            {displayItem}
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-pixel-bg-dark to-transparent z-10" />
        </div>

        {/* Spinning indicator dots */}
        {isSpinning && (
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-pixel-gold"
                style={{
                  animation: 'blink 0.5s step-end infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side decorations */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2">
        <div className={cn(
          'w-4 h-4 rotate-45',
          isSpinning ? 'bg-pixel-gold animate-pulse' : 'bg-pixel-primary/50'
        )} />
      </div>
      <div className="absolute -right-6 top-1/2 -translate-y-1/2">
        <div className={cn(
          'w-4 h-4 rotate-45',
          isSpinning ? 'bg-pixel-gold animate-pulse' : 'bg-pixel-primary/50'
        )} />
      </div>
    </div>
  );
}

