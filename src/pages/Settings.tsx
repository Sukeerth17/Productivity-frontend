import { ArrowLeft, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full border-game flex items-center justify-center btn-press">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold">Settings</h1>
        </div>

        <div className="card-game p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center border-game">
              <User size={18} className="text-primary" />
            </div>
            <h2 className="font-heading font-extrabold text-lg">Account</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Name</p>
              <p className="font-heading font-bold text-base">{user?.name ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Email</p>
              <p className="font-heading font-bold text-base break-all">{user?.email ?? "Unknown"}</p>
            </div>
          </div>
        </div>

        <div className="card-game p-5 sm:p-6 mb-6">
          <h2 className="font-heading font-extrabold text-lg mb-4">Application</h2>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Connected API</p>
            <p className="font-mono text-xs sm:text-sm break-all">{API_BASE}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full py-3 rounded-inner border-game bg-primary text-primary-foreground font-heading font-bold uppercase shadow-tactile btn-press flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
