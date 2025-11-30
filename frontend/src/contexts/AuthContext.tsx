/**
 * Authentication Context for managing user authentication state
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@jackdo69/job-tracker-shared-types';

// Frontend-specific auth context type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}
import { authApi, tokenManager } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getToken();
      if (token) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, remove it
          tokenManager.removeToken();
        }
      }
      setIsLoading(false);
    };

    void initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login({ email, password });
    tokenManager.setToken(response.accessToken);
    setUser(response.user);
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<void> => {
    await authApi.register({
      email,
      password,
      fullName: fullName,
    });

    // Auto-login after registration
    await login(email, password);
  };

  const loginWithGoogle = async (): Promise<void> => {
    const authUrl = await authApi.getGoogleLoginUrl();
    // Redirect to Google OAuth consent page
    window.location.href = authUrl;
  };

  const logout = (): void => {
    tokenManager.removeToken();
    setUser(null);
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use the auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
