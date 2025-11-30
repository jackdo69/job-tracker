/**
 * Google OAuth callback handler
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { authApi, tokenManager } from '../../services/api';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google authentication failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Exchange the short code for the access token
        // This is more reliable on mobile than passing the full JWT in the URL
        const response = await authApi.exchangeOAuthCode(code);

        // Store the token
        tokenManager.setToken(response.accessToken);

        // Force a full page reload to ensure auth state is properly initialized
        // This is more reliable on mobile Chrome than React Router navigation
        window.location.replace('/');
      } catch (err: unknown) {
        console.error('OAuth exchange error:', err);
        if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
          setError((err.response.data as { message?: string }).message || 'Failed to complete Google login');
        } else {
          setError('Failed to complete Google login');
        }
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    void handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {error ? (
            <>
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
              <p className="text-gray-600">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Completing Google Sign In
              </h2>
              <p className="text-gray-600 mt-2">Please wait...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
