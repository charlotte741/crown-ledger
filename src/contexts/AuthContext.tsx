/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
// import { useNavigate } from 'react-router-dom';
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
} from 'react';

const AuthContext = createContext<any>(null);

// Helper function to decode token safely
const decodeToken = (token: string) => {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    return JSON.parse(atob(parts[1]));
  } catch (error) {
    // console.error('Invalid token:', error);
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token: string) => {
  const payload = decodeToken(token);

  if (!payload?.exp) return true;

  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

export const AuthProvider = ({ children }: any) => {
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
  const [loginToken, setLoginToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
//   const navigate = useNavigate();
const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any existing auto logout timer
  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Logout function
const logout = useCallback(() => {
  clearLogoutTimer();

  setUserId(null);
  setLoginToken(null);

  localStorage.removeItem('userId');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userProfile');

  window.location.replace('/login');
}, [clearLogoutTimer]);

  // Sync userId to localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [userId]);

  // Sync refreshToken to localStorage
  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, [refreshToken]);

  // Schedule automatic logout based on token expiry
  const scheduleAutoLogout = useCallback(
    (token: string) => {
      const payload = decodeToken(token);

      if (!payload?.exp) {
        logout();
        return;
      }

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = (payload.exp - currentTime) * 1000;

      if (timeUntilExpiry <= 0) {
        logout();
        return;
      }

      clearLogoutTimer();

      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, timeUntilExpiry);
    },
    [clearLogoutTimer, logout]
  );

  // Sync token to localStorage and schedule logout
  useEffect(() => {
    if (loginToken) {
      if (isTokenExpired(loginToken)) {
        logout();
        return;
      }

      localStorage.setItem('accessToken', loginToken);
      scheduleAutoLogout(loginToken);
    } else {
      localStorage.removeItem('accessToken');
      clearLogoutTimer();
    }
  }, [loginToken, logout, scheduleAutoLogout, clearLogoutTimer]);

  // Run token validation on first load
  useEffect(() => {
    if (loginToken) {
      if (isTokenExpired(loginToken)) {
        logout();
      } else {
        scheduleAutoLogout(loginToken);
      }
    }

    return () => {
      clearLogoutTimer();
    };
  }, [loginToken, logout, scheduleAutoLogout, clearLogoutTimer]);

  const value = useMemo(
    () => ({
      userId,
      loginToken,
      refreshToken,
      setUserId,
      setLoginToken,
      setRefreshToken,
      logout,
      isAuthenticated: !!loginToken && !isTokenExpired(loginToken),
    }),
    [userId, loginToken, refreshToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
