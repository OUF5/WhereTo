'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, setTokens, clearTokens, getAccessToken } from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  city: string;
}

interface Tenant {
  id: string;
  groupName: string;
  joinCode: string;
}

interface Membership {
  tenantId: string;
  role: string;
  isCurrent: boolean;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  membership: Membership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    city: string;
    mode: 'create_tenant' | 'join_by_code';
    groupName?: string;
    joinCode?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setTenant(null);
        setMembership(null);
        return;
      }

      const data = await api.users.me();
      setUser({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        city: data.city,
      });

      if (data.currentMembership) {
        setTenant(data.currentMembership.tenant);
        setMembership({
          tenantId: data.currentMembership.tenantId,
          role: data.currentMembership.role,
          isCurrent: data.currentMembership.isCurrent,
        });
      }
    } catch {
      // If request fails, clear everything
      clearTokens();
      setUser(null);
      setTenant(null);
      setMembership(null);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    setTokens(response.tokens.access, response.tokens.refresh);
    await refreshUser();
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    city: string;
    mode: 'create_tenant' | 'join_by_code';
    groupName?: string;
    joinCode?: string;
  }) => {
    const response = await api.auth.register(data);
    setTokens(response.tokens.access, response.tokens.refresh);
    
    setUser({
      id: response.user.id,
      fullName: response.user.fullName,
      email: response.user.email,
      city: response.user.city,
    });
    
    setTenant({
      id: response.tenant.id,
      groupName: response.tenant.groupName,
      joinCode: '', // Will be fetched on next user refresh
    });
    
    setMembership({
      tenantId: response.tenant.id,
      role: response.membership.role,
      isCurrent: response.membership.isCurrent,
    });

    // Refresh to get full tenant data including joinCode
    await refreshUser();
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setTenant(null);
    setMembership(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        membership,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

