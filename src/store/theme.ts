import { create } from "zustand";

export type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  hydrate: () => void;
}

const apply = (m: ThemeMode) => {
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(`theme-${m}`);
};

export const useTheme = create<ThemeState>((set, get) => ({
  mode: "dark",
  setMode: (mode) => {
    localStorage.setItem("theme_mode", mode);
    apply(mode);
    set({ mode });
  },
  toggle: () => get().setMode(get().mode === "dark" ? "light" : "dark"),
  hydrate: () => {
    const saved = (localStorage.getItem("theme_mode") as ThemeMode) || "dark";
    apply(saved);
    set({ mode: saved });
  },
}));
