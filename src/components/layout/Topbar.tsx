import { Bell, Search, LogOut, Sun, Moon, Sparkles } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/store/theme";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const nav = useNavigate();
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass-strong flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Mobile brand */}
        <div className="md:hidden flex items-center gap-2 pr-1">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <div className="font-display text-base leading-none">Momentum</div>
        </div>

        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search tasks, categories…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition text-sm"
          />
        </div>
        <div className="flex-1" />
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          aria-label="Search"
          className="sm:hidden size-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10">
          <Search className="size-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          aria-label="Notifications"
          className="hidden sm:grid size-10 rounded-xl bg-white/5 border border-white/10 place-items-center hover:bg-white/10">
          <Bell className="size-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
          onClick={toggle}
          aria-label="Toggle theme"
          title={mode === "dark" ? "Switch to Emerald light" : "Switch to Obsidian dark"}
          className="relative size-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10 overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={mode}
              initial={{ y: -14, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 14, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid place-items-center"
            >
              {mode === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 pr-0 sm:pr-1">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium leading-none">{user?.name || "—"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
          <div className="size-10 rounded-xl bg-gradient-accent grid place-items-center font-semibold text-primary-foreground shadow-glow">
            {initials}
          </div>
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => { logout(); nav("/login"); }}
            className="hidden sm:grid size-10 rounded-xl bg-white/5 border border-white/10 place-items-center hover:bg-destructive/30"
            title="Log out">
            <LogOut className="size-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
