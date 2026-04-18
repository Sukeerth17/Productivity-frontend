import { createContext, useContext, useMemo, useState } from "react";
import { logIn, signUp, type AuthUser } from "@/lib/api";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const TOKEN_KEY = "productvity-auth-token";
const USER_KEY = "productvity-auth-user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in restricted browser modes (e.g. Safari private mode).
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in restricted browser modes.
  }
}

function loadUser(): AuthUser | null {
  const raw = safeGetItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => safeGetItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const persist = (nextToken: string, nextUser: AuthUser) => {
    safeSetItem(TOKEN_KEY, nextToken);
    safeSetItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (payload: { email: string; password: string }) => {
    const res = await logIn(payload);
    persist(res.token, res.user);
  };

  const signup = async (payload: { name: string; email: string; password: string }) => {
    const res = await signUp(payload);
    persist(res.token, res.user);
  };

  const logout = () => {
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, login, signup, logout, isAuthenticated: !!token }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
