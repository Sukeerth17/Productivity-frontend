export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ApiCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface ApiSubTask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  task_id: string;
}

export interface ApiTask {
  id: string;
  title: string;
  category_id: string;
  notes: string | null;
  completed: boolean;
  is_habit: boolean;
  priority: "low" | "medium" | "high" | null;
  due_time: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
  subtasks: ApiSubTask[];
}

export interface ApiPaginatedTasks {
  items: ApiTask[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiDashboardStats {
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  categories: number;
  completion_rate: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const REQUEST_TIMEOUT_MS = 20_000;

function buildErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Server is waking up. Please try again in a few seconds.";
  }
  if (error instanceof TypeError) {
    return "Cannot reach server. Check your internet and try again.";
  }
  return "Request failed";
}

function withTimeoutSignal(timeoutMs: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cleanup: () => window.clearTimeout(timeoutId),
  };
}

function getApiRoot(): string {
  try {
    const url = new URL(API_BASE);
    return `${url.origin}${url.pathname.replace(/\/api\/v1\/?$/, "")}`;
  } catch {
    return API_BASE.replace(/\/api\/v1\/?$/, "");
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { signal, cleanup } = withTimeoutSignal(REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
      signal,
    });
  } catch (error) {
    throw new Error(buildErrorMessage(error));
  } finally {
    cleanup();
  }

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const data = await response.json();
      detail = data.detail ?? detail;
    } catch {
      // ignore non-json failures
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function warmUpBackend() {
  const { signal, cleanup } = withTimeoutSignal(8_000);
  try {
    await fetch(`${getApiRoot()}/health`, { method: "GET", cache: "no-store", signal });
  } catch {
    // Best-effort warmup only.
  } finally {
    cleanup();
  }
}

export function signUp(payload: { name: string; email: string; password: string }) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logIn(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCategories() {
  return request<ApiCategory[]>("/categories");
}

export function createCategory(payload: { name: string; color: string; icon: string }) {
  return request<ApiCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function patchCategory(categoryId: string, payload: { name?: string; color?: string; icon?: string }) {
  return request<ApiCategory>(`/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(categoryId: string) {
  return request<void>(`/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function getTasks(params?: { categoryId?: string; completed?: boolean; limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set("category_id", params.categoryId);
  if (typeof params?.completed === "boolean") query.set("completed", String(params.completed));
  query.set("limit", String(params?.limit ?? 200));
  query.set("offset", String(params?.offset ?? 0));
  return request<ApiPaginatedTasks>(`/tasks?${query.toString()}`);
}

export function createTask(payload: {
  title: string;
  category_id: string;
  notes?: string | null;
  completed?: boolean;
  is_habit?: boolean;
  priority?: "low" | "medium" | "high";
  due_time?: string | null;
  subtasks?: Array<{ title: string; completed?: boolean }>;
}) {
  return request<ApiTask>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(taskId: string) {
  return request<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export function toggleTask(taskId: string) {
  return request<ApiTask>(`/tasks/${taskId}/toggle`, {
    method: "POST",
  });
}

export function toggleSubTask(taskId: string, subTaskId: string) {
  return request<ApiSubTask>(`/tasks/${taskId}/subtasks/${subTaskId}/toggle`, {
    method: "POST",
  });
}

export function getDashboardStats() {
  return request<ApiDashboardStats>("/stats/dashboard");
}
