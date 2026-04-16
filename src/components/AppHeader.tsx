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
    <header className="flex items-center justify-between px-8 py-4 border-b-2 border-foreground/10">
      <button onClick={() => navigate("/")} className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center border-game">
          <Flame size={18} className="text-primary" />
        </div>
        <span className="font-heading text-lg font-bold">Momentum Builder</span>
      </button>
      <nav className="flex gap-1 items-center">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`px-4 py-2 rounded-inner font-heading font-bold text-sm transition-colors ${
              location.pathname === item.path
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="px-4 py-2 rounded-inner font-heading font-bold text-sm transition-colors hover:bg-secondary"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
