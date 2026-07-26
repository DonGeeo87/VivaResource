"use client";

const TOKEN_KEY = "viva_admin_token";
const USER_KEY = "viva_admin_user";

export interface StoredUser {
  uid: string;
  email: string | null;
  role: "admin" | "editor" | "viewer";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function loginWithJwt(
  email: string,
  password: string
): Promise<{ token: string; user: StoredUser }> {
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
  return { token: data.token, user: data.user };
}
