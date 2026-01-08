'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth';
import { ArcadeFrame } from '@/components/layout/ArcadeFrame';
import { Header } from '@/components/layout/Header';
import { PixelButton, PixelSelect, PixelAlert, PixelCard } from '@/components/ui';
import { SpinWheel } from '@/components/features/SpinWheel';
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from '@/lib/validation';
import { api, ApiError, getArcadeErrorTitle } from '@/lib/api';

interface SpinResult {
  id: string;
  name: string;
  category: string;
  description: string | null;
  suggestedBy: { id: string; fullName: string };
}

function RouletteContent() {
  const { tenant } = useAuth();

  const [category, setCategory] = useState<string>('');
  const [places, setPlaces] = useState<SpinResult[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  // Load places when category changes
  useEffect(() => {
    const loadPlaces = async () => {
      if (!tenant?.id || !category) {
        setPlaces([]);
        return;
      }

      setIsLoadingPlaces(true);
      setError(null);

      try {
        const data = await api.places.list(tenant.id, { category, isActive: true });
        setPlaces(data.items);
        // Reset exclusions when category changes
        setExcludedIds([]);
        setResult(null);
      } catch (err) {
        const apiErr = err as ApiError;
        setError(apiErr.detail || 'Failed to load places');
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    loadPlaces();
  }, [tenant?.id, category]);

  const handleSpin = async () => {
    if (!tenant?.id || !category) return;

    setError(null);
    setIsSpinning(true);
    setResult(null);

    try {
      const data = await api.spins.create(tenant.id, {
        type: 'GROUP_SUGGESTED',
        category,
        excludedItemKeys: excludedIds,
      });

      // Wait for spin animation to complete
      setTimeout(() => {
        setResult(data.result.place);
        setIsSpinning(false);
        setSpinCount((prev) => prev + 1);
      }, 2500);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.detail || 'No places available');
      setIsSpinning(false);
    }
  };

  const handleSpinAgain = () => {
    if (result) {
      setExcludedIds((prev) => [...prev, result.id]);
    }
    setResult(null);
    handleSpin();
  };

  const handleReset = () => {
    setExcludedIds([]);
    setResult(null);
    setSpinCount(0);
  };

  const availablePlaces = places.filter((p) => !excludedIds.includes(p.id));
  const placeNames = availablePlaces.map((p) => p.name);

  return (
    <ArcadeFrame>
      <Header title="GROUP ROULETTE" showBack backHref="/" />

      {/* Arcade style subtitle */}
      <div className="text-center mb-6">
        <p className="font-arcade text-lg text-pixel-muted">
          Let fate decide your destination!
        </p>
      </div>

      {error && (
        <PixelAlert variant="error" title={getArcadeErrorTitle(404)} className="mb-6" onClose={() => setError(null)}>
          {error}
        </PixelAlert>
      )}

      {/* Category selector */}
      <div className="mb-6">
        <PixelSelect
          label="Choose Category"
          name="category"
          options={CATEGORY_OPTIONS}
          placeholder="Select adventure type..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {/* Stats bar */}
      {category && (
        <div className="flex justify-between text-center mb-6 px-2">
          <div>
            <p className="font-pixel text-[8px] text-pixel-muted">POOL</p>
            <p className="font-arcade text-lg text-pixel-primary">{places.length}</p>
          </div>
          <div>
            <p className="font-pixel text-[8px] text-pixel-muted">AVAILABLE</p>
            <p className="font-arcade text-lg text-pixel-success">{availablePlaces.length}</p>
          </div>
          <div>
            <p className="font-pixel text-[8px] text-pixel-muted">SPINS</p>
            <p className="font-arcade text-lg text-pixel-gold">{spinCount}</p>
          </div>
        </div>
      )}

      {/* Spin Wheel */}
      {category && (
        <div className="mb-8">
          <SpinWheel
            isSpinning={isSpinning}
            items={placeNames.length > 0 ? placeNames : ['No places yet!']}
          />
        </div>
      )}

      {/* Result display */}
      {result && !isSpinning && (
        <PixelCard variant="highlight" glow className="mb-6 text-center">
          <p className="font-pixel text-[10px] text-pixel-gold mb-2">🎉 WINNER 🎉</p>
          <h3 className="font-arcade text-2xl text-pixel-text mb-2">{result.name}</h3>
          <p className="font-pixel text-[10px] text-pixel-muted mb-2">
            {CATEGORY_LABELS[result.category]}
          </p>
          {result.description && (
            <p className="font-arcade text-sm text-pixel-muted mb-2">
              &quot;{result.description}&quot;
            </p>
          )}
          <p className="font-arcade text-sm text-pixel-primary">
            Suggested by: {result.suggestedBy.fullName}
          </p>
        </PixelCard>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {!result ? (
          <PixelButton
            onClick={handleSpin}
            className="w-full"
            size="lg"
            disabled={!category || isLoadingPlaces || availablePlaces.length === 0 || isSpinning}
            isLoading={isSpinning}
          >
            {isSpinning ? 'SPINNING...' : '🎰 SPIN IT!'}
          </PixelButton>
        ) : (
          <>
            <PixelButton
              onClick={handleSpinAgain}
              className="w-full"
              size="lg"
              variant="secondary"
              disabled={availablePlaces.length <= 1}
            >
              🔄 SPIN AGAIN
            </PixelButton>
            <p className="font-arcade text-sm text-pixel-muted text-center">
              Don&apos;t like it? Try your luck again!
            </p>
          </>
        )}

        {excludedIds.length > 0 && (
          <button
            onClick={handleReset}
            className="w-full font-pixel text-[10px] text-pixel-muted hover:text-pixel-danger transition-colors py-2"
          >
            [RESET EXCLUSIONS]
          </button>
        )}
      </div>

      {/* No places warning */}
      {category && !isLoadingPlaces && places.length === 0 && (
        <PixelAlert variant="warning" className="mt-6">
          No places in this category yet! Ask your group to add some suggestions.
        </PixelAlert>
      )}

      {/* All excluded warning */}
      {category && availablePlaces.length === 0 && places.length > 0 && (
        <PixelAlert variant="info" className="mt-6">
          All places have been spun! Click reset to start over.
        </PixelAlert>
      )}

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="font-pixel text-[8px] text-pixel-muted">
          EACH SPIN EXCLUDES THE RESULT • RESET TO START FRESH
        </p>
      </div>
    </ArcadeFrame>
  );
}

export default function GroupRoulettePage() {
  return (
    <ProtectedRoute>
      <RouletteContent />
    </ProtectedRoute>
  );
}

