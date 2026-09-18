import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

const TOKEN_KEYS = { access: 'access', refresh: 'refresh' };

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
};

/** Extract a human-readable message from a DRF/axios error. */
export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;
  const firstField = Object.values(data).find((v) => typeof v === 'string' || Array.isArray(v));
  if (firstField) return Array.isArray(firstField) ? String(firstField[0]) : String(firstField);
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEYS.access);
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await api.get('/auth/me/');
      setUser(data);
      return data;
    } catch {
      // Token invalid/expired and refresh failed (handled by the axios
      // interceptor) -- start clean instead of flashing a broken state.
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login/', { username: email, password });
      localStorage.setItem(TOKEN_KEYS.access, data.access);
      localStorage.setItem(TOKEN_KEYS.refresh, data.refresh);
      // Fetch the profile with the new token instead of relying on stale
      // state, so the very next render already knows the role.
      const me = await checkUser();
      return me;
    } catch (error) {
      clearTokens();
      setUser(null);
      error.handledMessage = getApiErrorMessage(error, 'Invalid email or password.');
      throw error;
    }
  }, [checkUser]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isAdmin = useMemo(
    () =>
      Boolean(
        user &&
          (user.is_admin === true ||
            user.role === 'ADMIN' ||
            user.is_staff === true ||
            user.is_superuser === true)
      ),
    [user]
  );

  const value = useMemo(
    () => ({ user, setUser, login, logout, loading, checkUser, isAdmin }),
    [user, login, logout, loading, checkUser, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

/** Dashboard path for a given user object (or null). */
export const dashboardPathFor = (user) => {
  if (!user) return '/';
  if (user.role === 'TEACHER') return '/teacher/dashboard';
  if (user.role === 'ADMIN' || user.is_staff || user.is_superuser || user.is_admin) return '/owner';
  return '/student/dashboard';
};
