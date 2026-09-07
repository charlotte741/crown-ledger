/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import apiClient from '../utils/apiClientBackend';

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Hook to start automatic token refresh at app startup.
 * Refreshes the access token every 14 minutes to keep the session alive.
 * 
 * Usage: Place this in your root layout or main App component.
 * 
 * Example:
 * ```tsx
 * import { useTokenRefresh } from '@/hooks/useTokenRefresh';
 * 
 * export default function RootLayout() {
 *   useTokenRefresh(); // Starts auto-refresh
 *   return <>{children}</>;
 * }
 * ```
 */
export function useTokenRefresh() {
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // console.log('[TOKEN] No refresh token found - skipping auto-refresh');
      return;
    }

    // console.log('[TOKEN] Starting automatic token refresh (every 14 minutes)');

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('refreshToken');
        if (!token) {
          clearInterval(interval);
          return;
        }

        // console.log('[TOKEN] Performing scheduled token refresh...');
        const response = await apiClient('auth/refresh-token', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: token }),
        }) as RefreshTokenResponse;

        if (response.data?.accessToken && response.data?.refreshToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          // console.log('[TOKEN] Scheduled token refresh successful');
        }
      } catch (error) {
        // console.error('[TOKEN] Scheduled refresh failed:', error);
        // On failure, tokens will be cleared and user redirected by apiClient
        clearInterval(interval);
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(interval);
  }, []);
}

/**
 * Manual token refresh utility function.
 * Use this if you need to manually refresh tokens outside of the automatic interval.
 */
export async function manualTokenRefresh(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // console.error('[TOKEN] No refresh token available for manual refresh');
      return false;
    }

    // console.log('[TOKEN] Performing manual token refresh...');
    const response = await apiClient('auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }) as RefreshTokenResponse;

    if (response.data?.accessToken && response.data?.refreshToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken)
      // console.log('[TOKEN] Manual token refresh successful');
      return true;
    }

    return false;
  } catch (error) {
    // console.error('[TOKEN] Manual refresh failed:', error);
    return false;
  }
}
