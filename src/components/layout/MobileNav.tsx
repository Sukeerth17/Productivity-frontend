import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ListChecks, BarChart3, Settings, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/categories", label: "Tags", icon: Tag },
  { to: "/insights", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Me", icon: Settings },
];

export function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-strong px-2 py-2 flex items-center justify-between"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((it) => {
        const active = pathname === it.to;
        return (
          <NavLink
            key={it.to}
            to={it.to}
            className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl"
          >
            {active && (
              <motion.span
                layoutId="mobile-active-pill"
                className="absolute inset-0 rounded-xl bg-gradient-primary opacity-95 -z-10 shadow-glow"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <it.icon
              className={cn(
                "size-5 transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium tracking-wide transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {it.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
