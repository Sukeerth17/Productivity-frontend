import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Flame } from "lucide-react";
import { z } from "zod";

import { useAuth } from "@/lib/auth";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = signupSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    try {
      setLoading(true);
      await signup({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
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
          <h1 className="text-2xl font-heading font-extrabold">Create Account</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Name</label>
            <input
              className="mt-1 w-full border-game rounded-inner px-4 py-3 font-body bg-card focus:outline-none focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

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
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Confirm Password</label>
            <div className="mt-1 relative">
              <input
                className="w-full border-game rounded-inner px-4 py-3 pr-12 font-body bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                onPointerDown={(e) => e.preventDefault()}
                className="absolute inset-y-0 right-1 z-10 flex w-10 items-center justify-center text-muted hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-primary font-bold">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-inner border-game bg-primary text-primary-foreground font-heading font-bold uppercase shadow-tactile btn-press disabled:opacity-70"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-foreground underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
