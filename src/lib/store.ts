import { useState, useEffect, useCallback } from "react";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  completed: boolean;
  isHabit: boolean;
  priority: "low" | "medium" | "high";
  subTasks: SubTask[];
  dueTime?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DayHistory {
  date: string;
  completed: number;
  total: number;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  history: DayHistory[];
  streak: number;
  totalMomentum: number;
}

const STORAGE_KEY = "momentum-builder-state";

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    tasks: [],
    categories: [],
    history: [],
    streak: 0,
    totalMomentum: 0,
  };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  const toggleTask = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
          : t
      ),
      totalMomentum: s.totalMomentum + (s.tasks.find(t => t.id === taskId)?.completed ? -5 : 5),
    }));
  }, []);

  const toggleSubTask = useCallback((taskId: string, subId: string) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subTasks: t.subTasks.map((st) => st.id === subId ? { ...st, completed: !st.completed } : st) }
          : t
      ),
    }));
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }));
  }, []);

  const addCategory = useCallback((cat: Omit<Category, "id">) => {
    setState((s) => ({
      ...s,
      categories: [...s.categories, { ...cat, id: crypto.randomUUID() }],
    }));
  }, []);

  const deleteCategory = useCallback((catId: string) => {
    setState((s) => ({
      ...s,
      categories: s.categories.filter((c) => c.id !== catId),
      tasks: s.tasks.filter((t) => t.categoryId !== catId),
    }));
  }, []);

  const updateCategory = useCallback((catId: string, updates: Partial<Category>) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === catId ? { ...c, ...updates } : c)),
    }));
  }, []);

  const completedToday = state.tasks.filter((t) => t.completed).length;
  const totalToday = state.tasks.length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return {
    ...state,
    toggleTask, toggleSubTask, addTask, deleteTask,
    addCategory, deleteCategory, updateCategory,
    completedToday, totalToday, progressPercent,
  };
}

export const CATEGORY_COLORS = [
  "#FFE66D", "#FF9F43", "#FF6B6B", "#FF6B9D", "#9D4EDD", "#4ECDC4",
  "#2D9B83", "#26DE81", "#45AAF2", "#D1F2EB", "#F9E547", "#A0A083",
];

export const CATEGORY_ICONS = [
  "graduation-cap", "heart", "briefcase", "book-open", "dumbbell", "music",
  "palette", "code", "home", "star", "zap", "coffee",
];

export function getCategoryColorHex(color: string): string {
  const map: Record<string, string> = {
    "cat-college": "#FFE66D",
    "cat-health": "#4ECDC4",
    "cat-work": "#9D4EDD",
  };
  return map[color] || color;
}
