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
