import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signupRequest, loginRequest, fetchMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dvp_token'));
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already saved in this browser, verify it
  // against the backend and restore the session instead of forcing a
  // fresh sign-in every time the page reloads.
  useEffect(() => {
    async function restoreSession() {
      const savedToken = localStorage.getItem('dvp_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchMe(savedToken);
        setUser(res.data);
        setToken(savedToken);
      } catch {
        localStorage.removeItem('dvp_token');
        localStorage.removeItem('dvp_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await loginRequest({ email, password });
    localStorage.setItem('dvp_token', res.token);
    localStorage.setItem('dvp_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await signupRequest({ name, email, password });
    localStorage.setItem('dvp_token', res.token);
    localStorage.setItem('dvp_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dvp_token');
    localStorage.removeItem('dvp_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = { user, token, loading, isAuthenticated: Boolean(token && user), login, signup, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
