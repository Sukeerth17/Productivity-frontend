import { create } from "zustand";
import { api, type User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  setAuth: (token: string, user: User, persist?: boolean) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  ready: false,
  setAuth: (token, user, persist = true) => {
    if (persist) {
      localStorage.setItem("auth_token", token);
      localStorage.removeItem("auth_token_session");
    } else {
      sessionStorage.setItem("auth_token_session", token);
      localStorage.removeItem("auth_token");
    }
    set({ token, user, ready: true });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token_session");
    set({ token: null, user: null, ready: true });
  },
  hydrate: async () => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token_session");
    if (!token) { set({ ready: true }); return; }
    try { const user = await api.me(); set({ token, user, ready: true }); }
    catch { 
      localStorage.removeItem("auth_token"); 
      sessionStorage.removeItem("auth_token_session");
      set({ token: null, user: null, ready: true }); 
    }
  },
}));
