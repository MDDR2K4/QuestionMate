'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as jose from 'jose';

interface AuthContextType {
  token: string | null;
  user: { username: string } | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const claims = jose.decodeJwt(storedToken);
        if (claims.sub) {
          setUser({ username: claims.sub });
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Invalid token in storage", error);
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    try {
      const claims = jose.decodeJwt(newToken);
      if (claims.sub) {
        localStorage.setItem('authToken', newToken);
        setUser({ username: claims.sub });
        setToken(newToken);
      }
    } catch (error) {
      console.error("Failed to decode token", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}