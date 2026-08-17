"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { loginWithJwt, getToken, getUser, clearSession, setSession, type StoredUser } from "@/lib/auth/client";

interface AuthContextType {
  user: StoredUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const storedUser = getUser();
    const token = getToken();
    if (storedUser && token) {
      setUser(storedUser);
    } else if (token && !storedUser) {
      // Sesión corrupta: hay token pero el user no se puede restaurar.
      // Limpiar para evitar página en blanco (layout retorna null con !user pero token presente).
      clearSession();
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedUser } = await loginWithJwt(email, password);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
