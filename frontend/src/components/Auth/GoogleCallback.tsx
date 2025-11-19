/**
 * Google OAuth callback handler
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../../services/api';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google authentication failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setError('No access token received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Store the token
        tokenManager.setToken(token);

        // Redirect to home page
        window.location.href = '/';
      } catch (err: any) {
        setError('Failed to complete Google login');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
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
