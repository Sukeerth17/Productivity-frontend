import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ListChecks, BarChart3, Settings, Sparkles, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex w-64 shrink-0 p-4">
      <div className="glass-strong w-full p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg leading-none">Momentum</div>
            <div className="text-xs text-muted-foreground">Glass productivity</div>
          </div>
        </div>
        <div className="h-px bg-white/5 my-2" />
        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <NavLink key={it.to} to={it.to} className="relative">
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-primary opacity-90 -z-10 shadow-glow"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <it.icon className={cn("size-4", active && "text-primary-foreground")} />
                  <span className={cn(active && "text-primary-foreground font-medium")}>{it.label}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto p-3 rounded-xl bg-gradient-surface border border-white/5">
          <div className="text-xs text-muted-foreground">Tip</div>
          <div className="text-sm">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">
              {typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘N' : 'Ctrl+N'}
            </kbd> to add a task
          </div>
        </div>
      </div>
    </aside>
  );
}
