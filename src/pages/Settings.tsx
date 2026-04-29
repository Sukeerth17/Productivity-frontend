import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { GlassCard } from "@/components/glass/GlassCard";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Settings() {
  const { user, setAuth, token } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => { setName(user?.name || ""); }, [user]);

  const save = useMutation({
    mutationFn: () => api.updateMe({ name: name.trim() }),
    onSuccess: (u) => { if (token) setAuth(token, u); qc.invalidateQueries(); toast.success("Profile updated"); },
    onError: (e: any) => toast.error(e?.message || "Could not save"),
  });

  const updatePassword = useMutation({
    mutationFn: () => api.updateMe({ password: password.trim() }),
    onSuccess: () => { setPassword(""); setConfirmPassword(""); toast.success("Password updated successfully"); },
    onError: (e: any) => toast.error(e?.message || "Could not update password"),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="text-sm text-muted-foreground">Account</div>
        <h1 className="font-display text-3xl md:text-4xl">Settings</h1>
      </div>

      <GlassCard>
        <div className="font-display text-xl mb-4">Profile</div>
        <div className="space-y-3">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60" />
          </Field>
          <Field label="Email"><div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground">{user?.email}</div></Field>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}
            disabled={!name.trim() || save.isPending}
            onClick={() => save.mutate()}
            className="px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow flex items-center gap-2 disabled:opacity-60">
            {save.isPending && <Loader2 className="size-4 animate-spin" />} Save changes
          </motion.button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="font-display text-xl mb-4">Change Password</div>
        <div className="space-y-3">
          <Field label="New Password">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 size-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password">
            <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60" />
          </Field>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}
            disabled={!password.trim() || password.length < 8 || password !== confirmPassword || updatePassword.isPending}
            onClick={() => updatePassword.mutate()}
            className="px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow flex items-center gap-2 disabled:opacity-60">
            {updatePassword.isPending && <Loader2 className="size-4 animate-spin" />} Update password
          </motion.button>
        </div>
      </GlassCard>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
