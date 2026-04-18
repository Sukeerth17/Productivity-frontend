import { Flame, Zap } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAppState, getCategoryColorHex } from "@/lib/store";

export default function HistoryVault() {
  const store = useAppState();

  // Build contribution grid (last 6 months, weeks as columns)
  const last180 = store.history.slice(-180);
  const maxCompleted = Math.max(...last180.map(d => d.completed), 1);

  // Group by week (7 rows: Mon-Sun)
  const weeks: (typeof last180[number] | null)[][] = [];
  let currentWeek: (typeof last180[number] | null)[] = [];
  const firstDay = new Date(last180[0]?.date || Date.now());
  const startPad = (firstDay.getDay() + 6) % 7; // Monday=0
  for (let i = 0; i < startPad; i++) currentWeek.push(null);
  for (const day of last180) {
    currentWeek.push(day);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length) { while (currentWeek.length < 7) currentWeek.push(null); weeks.push(currentWeek); }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const day = week.find(d => d);
    if (day) {
      const m = new Date(day.date).getMonth();
      if (m !== lastMonth) { monthLabels.push({ label: new Date(day.date).toLocaleString("en", { month: "short" }), col: i }); lastMonth = m; }
    }
  });

  // Category completion bars
  const catStats = store.categories.map(cat => {
    const tasks = store.tasks.filter(t => t.categoryId === cat.id);
    const completed = tasks.filter(t => t.completed).length;
    const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return { ...cat, pct, colorHex: getCategoryColorHex(cat.color) };
  });

  const dayLabels = ["Mon", "", "Wed", "", "Fri", "", ""];

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

        {/* Contribution Grid */}
        <div className="card-game p-4 sm:p-6 mb-8 overflow-x-auto">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-lg font-heading font-extrabold">Last 6 Months Activity</h2>
            <div className="flex items-center gap-1 text-xs text-muted">
              Less
              {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
                <div key={o} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
              ))}
              More
            </div>
          </div>

          {/* Month headers */}
          <div className="flex ml-10 mb-1">
            {monthLabels.map((m) => (
              <div key={m.col} className="text-xs text-muted font-body absolute" style={{ left: m.col * 18 }}>
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex gap-0 mt-6">
            <div className="flex flex-col gap-[3px] mr-2 text-xs text-muted font-body pt-0">
              {dayLabels.map((l, i) => <div key={i} className="h-[16px] flex items-center">{l}</div>)}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-4 h-4" />;
                    const opacity = Math.max(0.1, day.completed / maxCompleted);
                    return (
                      <div
                        key={di}
                        className="w-4 h-4 rounded-sm cursor-pointer hover:ring-2 hover:ring-foreground transition-all"
                        style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                        title={`${day.date}: ${day.completed} tasks`}
                      />
                    );
                  })}
                </div>
              ))}
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
