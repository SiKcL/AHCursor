'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuth: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(false);

  // Inicializar desde localStorage
  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
    setIsAuth(!!t);
    function syncAuth() {
      const t = localStorage.getItem('token');
      setToken(t);
      setIsAuth(!!t);
    }
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  // Métodos de login/logout
  const login = (t: string) => {
    localStorage.setItem('token', t);
    setToken(t);
    setIsAuth(true);
    window.dispatchEvent(new Event('storage'));
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuth(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider value={{ isAuth, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 