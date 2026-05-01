import { Bell, Search, LogOut, Sun, Moon, Sparkles } from "lucide-react";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/store/theme";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const nav = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="glass-strong flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 min-h-[56px]">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="search-mode"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex items-center gap-2"
            >
              <Search className="size-4 text-muted-foreground ml-2" />
              <input
                autoFocus
                placeholder="Search tasks..."
                onChange={(e) => nav(`/tasks?search=${encodeURIComponent(e.target.value)}`)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <button onClick={() => setIsSearching(false)} className="p-2">
                <X className="size-4 text-muted-foreground" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="normal-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center gap-2 sm:gap-3 overflow-hidden"
            >
              {/* Mobile brand */}
              <div className="md:hidden flex items-center gap-2 pr-1 shrink-0">
                <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
                  <Sparkles className="size-4 text-primary-foreground" />
                </div>
                <div className="font-display text-base leading-none">Momentum</div>
              </div>

              <div className="relative flex-1 max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search tasks..."
                  onChange={(e) => nav(`/tasks?search=${encodeURIComponent(e.target.value)}`)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition text-sm"
                />
              </div>
              
              <div className="flex-1 hidden sm:block" />
              
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => setIsSearching(true)}
                aria-label="Search"
                className="sm:hidden size-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10 shrink-0">
                <Search className="size-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={toggle}
                aria-label="Toggle theme"
                className="relative size-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center hover:bg-white/10 overflow-hidden shrink-0"
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

              <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium leading-none truncate max-w-[120px]">{user?.name || "—"}</div>
                </div>
                <div className="size-10 rounded-xl bg-gradient-accent grid place-items-center font-semibold text-primary-foreground shadow-glow">
                  {initials}
                </div>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => { logout(); nav("/login"); }}
                  className="grid size-10 rounded-xl bg-white/5 border border-white/10 place-items-center hover:bg-destructive/30"
                  title="Log out">
                  <LogOut className="size-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
