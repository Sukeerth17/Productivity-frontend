// Typed API client for the FastAPI productivity backend.
// Configure VITE_API_URL or set localStorage("api_base") to override.

export type Priority = "low" | "medium" | "high";

export interface User { id: string; name: string; email: string; created_at: string }
export interface AuthResponse { token: string; user: User }
export interface Category { id: string; name: string; color: string; icon: string; created_at: string }
export interface SubTask { id: string; title: string; completed: boolean; position: number; task_id: string }
export interface Task {
  id: string; title: string; category_id: string; notes: string | null;
  completed: boolean; is_habit: boolean; priority: Priority | null; due_time: string | null;
  created_at: string; completed_at: string | null; updated_at: string; subtasks: SubTask[];
}
export interface PaginatedTasks { items: Task[]; total: number; limit: number; offset: number }
export interface DashboardStats {
  total_tasks: number; completed_tasks: number; active_tasks: number;
  categories: number; completion_rate: number;
}
export interface HistorySummary {
  started_at: string; since_start_total_tasks: number; since_start_completed_tasks: number;
  completion_rate: number; current_streak: number; total_momentum: number;
}
export interface CategoryBreakdownItem {
  category_id: string; category_name: string; color: string;
  total_tasks: number; completed_tasks: number; completion_rate: number;
}
export interface ProductivityStats {
  alltime_total_tasks: number; alltime_completed_tasks: number; alltime_completion_rate: number;
  month_total_tasks: number; month_completed_tasks: number; month_completion_rate: number;
  week_total_tasks: number; week_completed_tasks: number; week_completion_rate: number;
  day_total_tasks: number; day_completed_tasks: number; day_completion_rate: number;
  category_breakdown: CategoryBreakdownItem[] | null; updated_at: string;
}

const DEFAULT_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_BASE;
  return localStorage.getItem("api_base") || DEFAULT_BASE;
}
export function setApiBase(url: string) {
  localStorage.setItem("api_base", url.replace(/\/$/, ""));
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBase()}/api/v1${path}`, { ...opts, headers });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || res.statusText;
    throw new ApiError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

export const api = {
  // auth
  signup: (b: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(b) }),
  resetPassword: (b: { email: string; password: string }) =>
    request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify(b) }),
  me: () => request<User>("/auth/me"),
  updateMe: (b: { name?: string; password?: string }) => request<User>("/auth/me", { method: "PATCH", body: JSON.stringify(b) }),

  // categories
  listCategories: () => request<Category[]>("/categories"),
  createCategory: (b: { name: string; color?: string; icon?: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(b) }),
  updateCategory: (id: string, b: Partial<{ name: string; color: string; icon: string }>) =>
    request<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
  deleteCategory: (id: string) => request<void>(`/categories/${id}`, { method: "DELETE" }),

  // tasks
  listTasks: (q: { category_id?: string; completed?: boolean; priority?: Priority; limit?: number; offset?: number } = {}) => {
    const p = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && p.append(k, String(v)));
    const qs = p.toString();
    return request<PaginatedTasks>(`/tasks${qs ? `?${qs}` : ""}`);
  },
  createTask: (b: { title: string; category_id: string; notes?: string; priority?: Priority | null; due_time?: string | null; is_habit?: boolean }) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(b) }),
  updateTask: (id: string, b: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  toggleTask: (id: string) => request<Task>(`/tasks/${id}/toggle`, { method: "POST" }),

  // stats
  dashboard: () => request<DashboardStats>("/stats/dashboard"),
  history: () => request<HistorySummary>("/stats/history-summary"),
  productivity: () => request<ProductivityStats>("/stats/productivity"),
};
