import { Flame, Zap } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAppState, getCategoryColorHex } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function HistoryVault() {
  const store = useAppState();
  const { user } = useAuth();

  const startDate = user?.created_at ? new Date(user.created_at) : null;
  const tasksSinceStart = startDate
    ? store.tasks.filter((task) => new Date(task.createdAt) >= startDate)
    : store.tasks;
  const totalSinceStart = tasksSinceStart.length;
  const completedSinceStart = tasksSinceStart.filter((task) => task.completed).length;
  const completionSinceStart = totalSinceStart > 0 ? completedSinceStart / totalSinceStart : 0;

  const circleRadius = 62;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const doneStroke = circleCircumference * completionSinceStart;

  // Category completion bars
  const catStats = store.categories.map(cat => {
    const tasks = store.tasks.filter(t => t.categoryId === cat.id);
    const completed = tasks.filter(t => t.completed).length;
    const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return { ...cat, pct, colorHex: getCategoryColorHex(cat.color) };
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mb-1">History Vault</h1>
        <p className="text-muted text-sm mb-8">Your legacy of consistency.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="card-game p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Momentum</p>
              <p className="text-4xl font-heading font-extrabold">{store.totalMomentum.toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <Zap size={28} className="text-accent" />
            </div>
          </div>
          <div className="card-game p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Current Streak</p>
              <p className="text-4xl font-heading font-extrabold text-primary">{store.streak} Days</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center border-game">
              <Flame size={28} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="card-game p-5 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="relative w-44 h-44 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150" aria-label="Lifetime completion ring">
                <circle
                  cx="75"
                  cy="75"
                  r={circleRadius}
                  fill="none"
                  stroke="#FF6B6B"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <circle
                  cx="75"
                  cy="75"
                  r={circleRadius}
                  fill="none"
                  stroke="#26DE81"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${doneStroke} ${circleCircumference}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-heading font-extrabold">{completedSinceStart}/{totalSinceStart}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Tasks Completed</p>
              </div>
            </div>

            <div className="w-full">
              <h2 className="text-lg font-heading font-extrabold mb-1">Since You Started</h2>
              <p className="text-sm text-muted mb-4">
                {startDate
                  ? `Tracking from ${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "Tracking from your first day"}
              </p>
              <div className="flex flex-wrap gap-5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#26DE81]" />
                  <span className="font-bold">Done: {completedSinceStart}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                  <span className="font-bold">Not Done: {Math.max(totalSinceStart - completedSinceStart, 0)}</span>
                </div>
                <div className="font-bold text-muted">
                  Completion: {Math.round(completionSinceStart * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="card-game p-4 sm:p-6">
          <h2 className="text-lg font-heading font-extrabold mb-6">30-Day Completion by Category</h2>
          <div className="flex items-end gap-4 sm:gap-8 justify-start sm:justify-center h-48 overflow-x-auto pb-1">
            {catStats.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                <div className="relative w-16" style={{ height: `${Math.max(cat.pct * 1.6, 10)}px` }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-inner"
                    style={{ height: "100%", backgroundColor: cat.colorHex }}
                  />
                </div>
                <span className="text-xs font-heading font-bold">{cat.name}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted mt-2 px-4">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
