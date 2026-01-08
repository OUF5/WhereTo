'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ArcadeFrame } from '@/components/layout/ArcadeFrame';
import { Header } from '@/components/layout/Header';
import { PixelButton, PixelInput, PixelAlert } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { ApiError, getArcadeErrorTitle } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
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
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ArcadeFrame>
      <Header title="PLAYER LOGIN" />

      {/* Pixel art decoration */}
      <div className="flex justify-center mb-6">
        <div className="text-4xl">🎮</div>
      </div>

      {apiError && (
        <PixelAlert variant="error" title={getArcadeErrorTitle(401)} className="mb-6">
          {apiError}
        </PixelAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <PixelInput
          label="Email"
          name="email"
          type="email"
          placeholder="player@email.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <PixelInput
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <PixelButton
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          START GAME
        </PixelButton>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-[2px] bg-pixel-muted" />
        <span className="font-pixel text-[8px] text-pixel-muted">OR</span>
        <div className="flex-1 h-[2px] bg-pixel-muted" />
      </div>

      {/* Register link */}
      <div className="text-center">
        <p className="font-arcade text-lg text-pixel-muted mb-2">
          NEW PLAYER?
        </p>
        <Link href="/register">
          <PixelButton variant="ghost" size="md">
            CREATE ACCOUNT
          </PixelButton>
        </Link>
      </div>

      {/* High score style footer */}
      <div className="mt-8 text-center">
        <p className="font-pixel text-[8px] text-pixel-muted">
          PRESS START TO BEGIN YOUR ADVENTURE
        </p>
      </div>
    </ArcadeFrame>
  );
}

