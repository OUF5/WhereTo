// API Error type matching RFC 9457 Problem Details
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Arcade-style error messages
const ARCADE_ERROR_TITLES: Record<number, string> = {
  400: 'BAD INPUT',
  401: 'ACCESS DENIED',
  403: 'FORBIDDEN ZONE',
  404: 'NOT FOUND',
  409: 'COLLISION DETECTED',
  422: 'INVALID INPUT',
  500: 'SYSTEM MALFUNCTION',
};

export function getArcadeErrorTitle(status: number): string {
  return ARCADE_ERROR_TITLES[status] || 'ERROR';
}

// Token management
const ACCESS_TOKEN_KEY = 'ar_access_token';
const REFRESH_TOKEN_KEY = 'ar_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

// Fetch wrapper with auth
interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth header if needed
  if (auth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 - try to refresh token
  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the request with new token
      const newToken = getAccessToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      if (!retryResponse.ok) {
        const error = await retryResponse.json();
        throw error as ApiError;
      }

      return retryResponse.json();
    } else {
      // Refresh failed, clear tokens and throw
      clearTokens();
      const error = await response.json();
      throw error as ApiError;
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw error as ApiError;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Token refresh helper
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    setTokens(data.tokens.access, data.tokens.refresh);
    return true;
  } catch {
    return false;
  }
}

// API endpoints
export const api = {
  auth: {
    register: (data: {
      fullName: string;
      email: string;
      password: string;
      city: string;
      mode: 'create_tenant' | 'join_by_code';
      groupName?: string;
      joinCode?: string;
    }) =>
      apiFetch<{
        user: { id: string; fullName: string; email: string; city: string };
        tenant: { id: string; groupName: string };
        membership: { id: string; role: string; isCurrent: boolean };
        tokens: { access: string; refresh: string };
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        auth: false,
      }),

    login: (data: { email: string; password: string }) =>
      apiFetch<{
        user: { id: string };
        tokens: { access: string; refresh: string };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
        auth: false,
      }),

    refresh: (refreshToken: string) =>
      apiFetch<{ tokens: { access: string; refresh: string } }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        auth: false,
      }),
  },

  users: {
    me: () =>
      apiFetch<{
        id: string;
        fullName: string;
        email: string;
        city: string;
        isActive: boolean;
        currentMembership: {
          tenantId: string;
          role: string;
          isCurrent: boolean;
          tenant: { id: string; groupName: string; joinCode: string };
        } | null;
      }>('/users/me'),
  },

  tenants: {
    get: (tenantId: string) =>
      apiFetch<{
        id: string;
        groupName: string;
        joinCode: string;
        createdAt: string;
      }>(`/tenants/${tenantId}`),

    members: (tenantId: string) =>
      apiFetch<{
        items: Array<{
          id: string;
          user: { id: string; fullName: string };
          role: string;
          joinedAt: string;
        }>;
        next_cursor: string | null;
      }>(`/tenants/${tenantId}/members`),
  },

  places: {
    list: (tenantId: string, params?: { category?: string; isActive?: boolean; q?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      if (params?.q) searchParams.set('q', params.q);
      const query = searchParams.toString();
      return apiFetch<{
        items: Array<{
          id: string;
          name: string;
          category: string;
          description: string | null;
          suggestedBy: { id: string; fullName: string };
          isActive: boolean;
          createdAt: string;
        }>;
        next_cursor: string | null;
      }>(`/tenants/${tenantId}/places${query ? `?${query}` : ''}`);
    },

    create: (tenantId: string, data: { name: string; category: string; description?: string }) =>
      apiFetch<{
        id: string;
        name: string;
        category: string;
        description: string | null;
        suggestedBy: { id: string; fullName: string };
        isActive: boolean;
        createdAt: string;
      }>(`/tenants/${tenantId}/places`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  spins: {
    create: (
      tenantId: string,
      data: { type: 'GROUP_SUGGESTED'; category: string; excludedItemKeys?: string[] }
    ) =>
      apiFetch<{
        id: string;
        type: string;
        tenantId: string;
        userId: string;
        excludedItemKeys: string[];
        startedAt: string;
        result: {
          source: string;
          place: {
            id: string;
            name: string;
            category: string;
            description: string | null;
            suggestedBy: { id: string; fullName: string };
          };
        };
      }>(`/tenants/${tenantId}/spins`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  catalog: {
    categories: () =>
      apiFetch<{ items: string[] }>('/catalog/categories', { auth: false }),
    roles: () =>
      apiFetch<{ items: string[] }>('/catalog/roles', { auth: false }),
  },
};

