import { useState } from "react";
import { ArrowLeft, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateName } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await updateName(trimmed);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update name right now.");
    } finally {
      setSaving(false);
    }
  };

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
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Name</p>
              <div className="mt-1 flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-game rounded-inner px-3 py-2 font-body bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="shrink-0 px-4 py-2 rounded-inner border-game bg-primary text-primary-foreground font-heading font-bold btn-press disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              {saved ? <p className="text-xs font-bold text-accent mt-2">Name updated.</p> : null}
              {error ? <p className="text-xs font-bold text-primary mt-2">{error}</p> : null}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Email</p>
              <p className="font-heading font-bold text-base break-all">{user?.email ?? "Unknown"}</p>
            </div>
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
