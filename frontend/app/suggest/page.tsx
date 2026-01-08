'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth';
import { ArcadeFrame } from '@/components/layout/ArcadeFrame';
import { Header } from '@/components/layout/Header';
import { PixelButton, PixelInput, PixelSelect, PixelTextarea, PixelAlert, PixelCard } from '@/components/ui';
import { createPlaceSchema, CATEGORY_OPTIONS, type CreatePlaceInput } from '@/lib/validation';
import { api, ApiError, getArcadeErrorTitle } from '@/lib/api';

function SuggestContent() {
  const router = useRouter();
  const { tenant } = useAuth();

  const [formData, setFormData] = useState<CreatePlaceInput>({
    name: '',
    category: '' as CreatePlaceInput['category'],
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedPlace, setSubmittedPlace] = useState<{ name: string; category: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    // Validate
    const result = createPlaceSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!tenant?.id) {
      setApiError('No group selected');
      return;
    }

    setIsLoading(true);

    try {
      await api.places.create(tenant.id, {
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
      });

      // Show success state
      setSubmittedPlace({ name: formData.name, category: formData.category });
      setIsSuccess(true);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(apiErr.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0];
        });
        setErrors(fieldErrors);
      } else {
        setApiError(apiErr.detail || 'Failed to suggest place');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({ name: '', category: '' as CreatePlaceInput['category'], description: '' });
    setIsSuccess(false);
    setSubmittedPlace(null);
  };

  // Success state
  if (isSuccess && submittedPlace) {
    return (
      <ArcadeFrame>
        <Header title="SUCCESS!" showBack backHref="/" />

        <div className="text-center py-8">
          {/* Success animation */}
          <div className="text-6xl mb-6 animate-bounce">✓</div>

          <h2 className="font-pixel text-sm text-pixel-success glow-green mb-4">
            PLACE ADDED!
          </h2>

          <PixelCard variant="highlight" glow className="mb-6">
            <p className="font-arcade text-2xl text-pixel-text mb-2">
              {submittedPlace.name}
            </p>
            <p className="font-pixel text-[10px] text-pixel-muted">
              {CATEGORY_OPTIONS.find((c) => c.value === submittedPlace.category)?.label}
            </p>
          </PixelCard>

          <p className="font-arcade text-lg text-pixel-muted mb-6">
            Your suggestion has been added to the pool!
          </p>

          <div className="space-y-3">
            <PixelButton onClick={handleAddAnother} variant="secondary" size="lg" className="w-full">
              ADD ANOTHER
            </PixelButton>

            <PixelButton onClick={() => router.push('/')} variant="ghost" size="md" className="w-full">
              BACK TO HOME
            </PixelButton>
          </div>
        </div>

        {/* Points earned animation */}
        <div className="text-center mt-4">
          <p className="font-pixel text-xs text-pixel-gold glow-gold animate-pulse">
            +100 POINTS!
          </p>
        </div>
      </ArcadeFrame>
    );
  }

  return (
    <ArcadeFrame>
      <Header title="SUGGEST A PLACE" showBack backHref="/" />

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="text-4xl">📍</div>
      </div>

      {apiError && (
        <PixelAlert variant="error" title={getArcadeErrorTitle(409)} className="mb-6">
          {apiError}
        </PixelAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <PixelSelect
          label="Category"
          name="category"
          options={CATEGORY_OPTIONS}
          placeholder="Select category..."
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
        />

        <PixelInput
          label="Place Name"
          name="name"
          placeholder="Shawarmer Exit 6"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <PixelTextarea
          label="Description (Optional)"
          name="description"
          placeholder="Where did you find this gem?"
          value={formData.description || ''}
          onChange={handleChange}
          error={errors.description}
          rows={3}
        />

        <PixelButton type="submit" className="w-full" size="lg" isLoading={isLoading}>
          ADD TO POOL
        </PixelButton>
      </form>

      {/* Tips */}
      <div className="mt-8 text-center">
        <p className="font-pixel text-[8px] text-pixel-muted mb-2">
          TIP: ADD PLACES YOUR GROUP MIGHT ENJOY
        </p>
        <div className="flex justify-center gap-4">
          {CATEGORY_OPTIONS.map((cat) => (
            <span key={cat.value} className="font-arcade text-sm text-pixel-muted">
              {cat.label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </ArcadeFrame>
  );
}

export default function SuggestPage() {
  return (
    <ProtectedRoute>
      <SuggestContent />
    </ProtectedRoute>
  );
}

