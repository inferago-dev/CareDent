import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi, setToken, clearToken, getToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Restore the session on first load if a token is already stored.
  useEffect(() => {
    // `loading` already starts false when there is no token, so there is
    // nothing to restore and nothing to set.
    if (!getToken()) return undefined;
    const controller = new AbortController();
    authApi
      .me({ signal: controller.signal })
      .then((res) => setUser(res.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* the local session is cleared either way */
    }
    clearToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await authApi.updateMe(data);
    setUser(res.user);
    return res.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* eslint-disable-next-line react-refresh/only-export-components --
   colocating the provider with its consumer hook is the documented React
   pattern; splitting them across modules to satisfy a Fast Refresh hint costs
   more than the hot-reload it buys. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
