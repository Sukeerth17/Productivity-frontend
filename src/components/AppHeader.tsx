import { Flame } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Categories", path: "/categories" },
  { label: "History Vault", path: "/history" },
  { label: "Settings", path: "/settings" },
];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <header className="border-b-2 border-foreground/10 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center border-game">
          <Flame size={18} className="text-primary" />
        </div>
        <span className="font-heading text-base sm:text-lg font-bold truncate">Momentum Builder</span>
      </button>
      <button
        onClick={() => { logout(); navigate("/login"); }}
        className="shrink-0 px-3 py-2 rounded-inner font-heading font-bold text-xs sm:text-sm transition-colors hover:bg-secondary"
      >
        Logout
      </button>
      </div>
      <nav className="mt-3 flex gap-2 items-center overflow-x-auto pb-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`shrink-0 whitespace-nowrap px-3 py-2 rounded-inner font-heading font-bold text-xs sm:text-sm transition-colors ${
              location.pathname === item.path
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
