"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getToken, getUser, clearSession, setSession, type StoredUser } from "@/lib/auth/client";
import type { VolunteerUser } from "@/types/volunteer";

interface VolunteerAuthContextType {
  user: VolunteerUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  activateAccount: (email: string, password: string, firstName: string, lastName: string, registrationId?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const VolunteerAuthContext = createContext<VolunteerAuthContextType | undefined>(undefined);

const VOLUNTEER_USER_KEY = "viva_volunteer_user";

function getVolunteerUser(): VolunteerUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(VOLUNTEER_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setVolunteerUser(user: VolunteerUser): void {
  localStorage.setItem(VOLUNTEER_USER_KEY, JSON.stringify(user));
}

function clearVolunteerUser(): void {
  localStorage.removeItem(VOLUNTEER_USER_KEY);
}

export function VolunteerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VolunteerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from localStorage
    const storedUser = getVolunteerUser();
    const token = getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/jwt-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Credenciales inválidas");
      }

      const data = await res.json();
      setSession(data.token, data.user);

      // Fetch volunteer profile
      const profileRes = await fetch("/api/volunteer/profile", {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (profileRes.ok) {
        const profile = await profileRes.json();
        const volunteerUser: VolunteerUser = {
          uid: data.user.uid,
          email: data.user.email || email,
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          status: profile.status || "active",
          registrationId: profile.registrationId,
          joinedAt: profile.joinedAt ? new Date(profile.joinedAt) : new Date(),
          lastLoginAt: profile.lastLoginAt ? new Date(profile.lastLoginAt) : undefined,
          language: profile.language || "en",
          notificationsEnabled: profile.notificationsEnabled ?? true,
          unreadMessages: profile.unreadMessages || 0,
          upcomingTasks: profile.upcomingTasks || 0,
        };
        setUser(volunteerUser);
        setVolunteerUser(volunteerUser);
      } else {
        // Admin user, not volunteer
        setUser(null);
        clearVolunteerUser();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
      throw err;
    }
  }, []);

  const activateAccount = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    registrationId?: string
  ) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/volunteer-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, registrationId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear cuenta");
      }

      const data = await res.json();
      setSession(data.token, { uid: data.user.uid, email: data.user.email, role: "viewer" });

      const volunteerUser: VolunteerUser = {
        uid: data.user.uid,
        email: data.user.email || email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: "",
        status: data.user.status || "active",
        registrationId: registrationId || undefined,
        joinedAt: new Date(),
        lastLoginAt: new Date(),
        language: "en",
        notificationsEnabled: true,
        unreadMessages: 0,
        upcomingTasks: 0,
      };
      setUser(volunteerUser);
      setVolunteerUser(volunteerUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear cuenta";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    clearSession();
    clearVolunteerUser();
    setUser(null);
  }, []);

  return (
    <VolunteerAuthContext.Provider
      value={{
        user,
        loading,
        login,
        activateAccount,
        logout,
        error,
      }}
    >
      {children}
    </VolunteerAuthContext.Provider>
  );
}

export function useVolunteerAuth(): VolunteerAuthContextType {
  const context = useContext(VolunteerAuthContext);
  if (context === undefined) {
    return {
      user: null,
      loading: false,
      login: async () => {},
      activateAccount: async () => {},
      logout: async () => {},
      error: null,
    };
  }
  return context;
}
