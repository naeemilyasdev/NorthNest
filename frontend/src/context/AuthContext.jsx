import React, { createContext, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const login = async (authToken, userData) => {
    const nextToken = typeof authToken === 'string' ? authToken : authToken?.token || '';
    const nextUser = userData || authToken?.user || null;

    if (nextToken) {
      localStorage.setItem('token', nextToken);
    }

    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('user');
    }

    setToken(nextToken);
    setUser(nextUser || null);
    return { token: nextToken, user: nextUser };
  };

  const register = async (authToken, userData) => login(authToken, userData);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getCurrentUser();
      setUser(data.user || null);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken('');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const isAuthenticated = Boolean(user);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      loadUser,
      updateUser,
      isAuthenticated,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
