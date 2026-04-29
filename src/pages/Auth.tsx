import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export default function Auth({ mode }: { mode: "login" | "signup" }) {
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();
  const loc = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill in all fields");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (isSignup && form.name.trim().length < 2) return toast.error("Please enter your name");
    setLoading(true);
    try {
      const res = isSignup
        ? await api.signup(form)
        : await api.login({ email: form.email, password: form.password });
      setAuth(res.token, res.user);
      toast.success(isSignup ? "Welcome aboard!" : "Welcome back!");
      nav((loc.state as any)?.from || "/", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }



  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden p-10">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative z-10 m-auto max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow animate-float">
              <Sparkles className="size-6 text-primary-foreground" />
            </div>
            <div className="font-display text-2xl">Momentum</div>
          </div>
          <h1 className="font-display text-5xl leading-tight mb-4">
            Build <span className="gradient-text">unstoppable</span> daily momentum.
          </h1>
          <p className="text-muted-foreground text-lg">
            A premium glass-finish workspace for tasks, habits, and focus — designed like Apple, fast like Linear.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {["Focus", "Habits", "Insights"].map((t, i) => (
              <motion.div key={t}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="glass p-4 text-center text-sm">
                {t}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.form
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          onSubmit={onSubmit}
          className="glass-strong w-full max-w-md p-8 space-y-5"
        >
          <div>
            <h2 className="font-display text-3xl">{isSignup ? "Create account" : "Welcome back"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignup ? "Start building momentum today" : "Sign in to your dashboard"}
            </p>
          </div>

          {isSignup && (
            <Field label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe" className={inputCls} />
            </Field>
          )}
          <Field label="Email">
            <input type="email" autoComplete="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@domain.com" className={inputCls} />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className={inputCls} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isSignup ? "Create account" : "Sign in"}
          </motion.button>



          <div className="text-sm text-muted-foreground text-center">
            {isSignup ? (
              <>Already have an account? <Link to="/login" className="text-foreground hover:underline">Sign in</Link></>
            ) : (
              <>New here? <Link to="/signup" className="text-foreground hover:underline">Create an account</Link></>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition placeholder:text-muted-foreground/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
