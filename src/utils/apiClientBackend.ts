/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

const baseURL = 'https://mobile-money-backend-tcyb.onrender.com'
// const baseURL = 'http://localhost:5000'

interface ApiClientOptions extends RequestInit {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

export const buildAuthHeaders = (customHeaders: Record<string, string> = {}, hasBody = false) => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken')

  const headers: Record<string, string> = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(refreshToken ? { 'x-refresh-token': refreshToken } : {}),
    ...customHeaders,
  };

  if (hasBody && !customHeaders['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // console.log('[TOKEN] Attempting to refresh access token...');

    const response = await fetch(`${baseURL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      // Refresh failed - clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error(data?.message || 'Token refresh failed');
    }

    const newAccessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    if (newAccessToken && newRefreshToken) {
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      // console.log('[TOKEN] Access token refreshed successfully');
      return newAccessToken;
    }

    throw new Error('No tokens in refresh response');
  } catch (error) {
    // console.error('[TOKEN] Refresh failed:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }
};

const apiClient = async (endpoint: string, options: ApiClientOptions = {}): Promise<any> => {
  const method = options.method || 'GET';

  // console.log(`${method} ${baseURL}/api/${endpoint}`);

  // Check if there's a body in the request
  const hasBody = options.body !== undefined;

  let response = await fetch(`${baseURL}/api/${endpoint}`, {
    method,
    credentials: 'include',
    ...options,
    headers: buildAuthHeaders(options.headers || {}, hasBody),
  });

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  // Check for new access token in response headers (auto-refresh)
  const newAccessTokenFromHeader = response.headers.get('x-new-access-token');
  if (newAccessTokenFromHeader) {
    localStorage.setItem('accessToken', newAccessTokenFromHeader);
    // console.log('[TOKEN] Access token auto-refreshed from response header');
  }

  // Handle 401 - token expired
  if (response.status === 401 && endpoint !== 'auth/refresh-token') {
    if (isRefreshing) {
      // Queue the request while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        // Retry with new token
        const newHeaders = buildAuthHeaders(options.headers || {}, hasBody);
        newHeaders['Authorization'] = `Bearer ${token}`;
        return fetch(`${baseURL}/api/${endpoint}`, {
          ...options,
          method,
          credentials: 'include',
          headers: newHeaders,
        }).then(async (retryResponse) => {
          let retryData;
          try {
            retryData = await retryResponse.json();
          } catch (error) {
            retryData = null;
          }
          if (!retryResponse.ok) {
            throw new Error(retryData?.message || 'Request failed after token refresh');
          }
          return retryData;
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();

    if (newToken) {
      processQueue(null, newToken);
      // Retry original request
      const newHeaders = buildAuthHeaders(options.headers || {}, hasBody);
      newHeaders['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${baseURL}/api/${endpoint}`, {
        ...options,
        method,
        credentials: 'include',
        headers: newHeaders,
      });

      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }
    } else {
      processQueue(new Error('Token refresh failed'), null);
    }
  }

  if (!response.ok) {
    // console.error('API Error Response:', data);
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
};

export default apiClient;
