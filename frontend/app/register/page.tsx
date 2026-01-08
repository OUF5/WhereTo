'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ArcadeFrame } from '@/components/layout/ArcadeFrame';
import { Header } from '@/components/layout/Header';
import { PixelButton, PixelInput, PixelAlert } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@/lib/validation';
import { ApiError, getArcadeErrorTitle } from '@/lib/api';

type RegisterMode = 'create_tenant' | 'join_by_code';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [mode, setMode] = useState<RegisterMode>('create_tenant');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    city: '',
    groupName: '',
    joinCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError(null);
  };

  const handleModeChange = (newMode: RegisterMode) => {
    setMode(newMode);
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    // Build payload
    const payload: RegisterInput = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      city: formData.city,
      mode,
      ...(mode === 'create_tenant' ? { groupName: formData.groupName } : { joinCode: formData.joinCode }),
    };

    // Validate
    const result = registerSchema.safeParse(payload);
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
      await register(payload);
      router.push('/');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) {
        // Field-specific errors
        const fieldErrors: Record<string, string> = {};
        Object.entries(apiErr.errors).forEach(([key, messages]) => {
          fieldErrors[key] = messages[0];
        });
        setErrors(fieldErrors);
      } else {
        setApiError(apiErr.detail || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ArcadeFrame>
      <Header title="NEW PLAYER" />

      {/* Mode toggle - pixel style tabs */}
      <div className="flex mb-6 border-4 border-pixel-muted">
        <button
          type="button"
          onClick={() => handleModeChange('create_tenant')}
          className={`flex-1 py-3 font-pixel text-[10px] transition-colors ${
            mode === 'create_tenant'
              ? 'bg-pixel-primary text-pixel-bg-dark'
              : 'bg-pixel-bg-dark text-pixel-muted hover:text-pixel-text'
          }`}
        >
          CREATE GROUP
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('join_by_code')}
          className={`flex-1 py-3 font-pixel text-[10px] transition-colors ${
            mode === 'join_by_code'
              ? 'bg-pixel-primary text-pixel-bg-dark'
              : 'bg-pixel-bg-dark text-pixel-muted hover:text-pixel-text'
          }`}
        >
          JOIN GROUP
        </button>
      </div>

      {apiError && (
        <PixelAlert
          variant="error"
          title={getArcadeErrorTitle(409)}
          className="mb-6"
        >
          {apiError}
        </PixelAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PixelInput
          label="Player Name"
          name="fullName"
          placeholder="Your name"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          autoComplete="name"
        />

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
          placeholder="Min 8 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <PixelInput
          label="City"
          name="city"
          placeholder="Your city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
        />

        {/* Conditional field based on mode */}
        {mode === 'create_tenant' ? (
          <PixelInput
            label="Group Name"
            name="groupName"
            placeholder="The Weekend Crew"
            value={formData.groupName}
            onChange={handleChange}
            error={errors.groupName}
          />
        ) : (
          <PixelInput
            label="Join Code"
            name="joinCode"
            placeholder="XXXXXXXXXXXX"
            value={formData.joinCode}
            onChange={handleChange}
            error={errors.joinCode}
            maxLength={12}
            className="uppercase tracking-widest"
          />
        )}

        <div className="pt-2">
          <PixelButton
            type="submit"
            className="w-full"
            size="lg"
            variant={mode === 'create_tenant' ? 'primary' : 'secondary'}
            isLoading={isLoading}
          >
            {mode === 'create_tenant' ? 'CREATE & START' : 'JOIN & START'}
          </PixelButton>
        </div>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-[2px] bg-pixel-muted" />
        <span className="font-pixel text-[8px] text-pixel-muted">OR</span>
        <div className="flex-1 h-[2px] bg-pixel-muted" />
      </div>

      {/* Login link */}
      <div className="text-center">
        <p className="font-arcade text-lg text-pixel-muted mb-2">
          ALREADY A PLAYER?
        </p>
        <Link href="/login">
          <PixelButton variant="ghost" size="md">
            LOGIN
          </PixelButton>
        </Link>
      </div>
    </ArcadeFrame>
  );
}

