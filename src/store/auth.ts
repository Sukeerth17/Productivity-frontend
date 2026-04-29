import { create } from "zustand";
import { api, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  ready: false,
  setAuth: (token, user) => {
    localStorage.setItem("auth_token", token);
    set({ token, user, ready: true });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ token: null, user: null, ready: true });
  },
  hydrate: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) { set({ ready: true }); return; }
    try { const user = await api.me(); set({ token, user, ready: true }); }
    catch { localStorage.removeItem("auth_token"); set({ token: null, user: null, ready: true }); }
  },
}));
