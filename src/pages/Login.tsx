import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Flame } from "lucide-react";
import { z } from "zod";

import { useAuth } from "@/lib/auth";
import { warmUpBackend } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void warmUpBackend();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      setLoading(true);
      await login(parsed.data);
      const redirectPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to login";
      if (message.toLowerCase().includes("invalid email or password")) {
        setError("Invalid email or password. If this is your first login, create an account first.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="card-game w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center border-game">
            <Flame size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold">Welcome Back</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Email</label>
            <input
              className="mt-1 w-full border-game rounded-inner px-4 py-3 font-body bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Password</label>
            <div className="mt-1 relative">
              <input
                className="w-full border-game rounded-inner px-4 py-3 pr-12 font-body bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                onPointerDown={(e) => e.preventDefault()}
                className="absolute inset-y-0 right-1 z-10 flex w-10 items-center justify-center text-muted hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-primary font-bold">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-inner border-game bg-primary text-primary-foreground font-heading font-bold uppercase shadow-tactile btn-press disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          New here?{" "}
          <Link to="/signup" className="font-bold text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
