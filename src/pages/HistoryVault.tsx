import { Flame, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import AppHeader from "@/components/AppHeader";
import { getCategoryColorHex } from "@/lib/store";
import { getHistorySummary, getProductivityStats } from "@/lib/api";

export default function HistoryVault() {
  const historySummaryQuery = useQuery({
    queryKey: ["history-summary"],
    queryFn: getHistorySummary,
  });

  const productivityStatsQuery = useQuery({
    queryKey: ["productivity-stats"],
    queryFn: getProductivityStats,
  });

  const summary = historySummaryQuery.data;
  const stats = productivityStatsQuery.data;

  const totalSinceStart = summary?.since_start_total_tasks ?? 0;
  const completedSinceStart = summary?.since_start_completed_tasks ?? 0;
  const completionSinceStart = totalSinceStart > 0 ? completedSinceStart / totalSinceStart : 0;
  const startDate = summary?.started_at ? new Date(summary.started_at) : null;

  const circleRadius = 62;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const doneStroke = circleCircumference * completionSinceStart;

  // Prepare pie chart data
  const pieData = (stats?.category_breakdown ?? [])
    .filter((cat) => cat.total_tasks > 0)
    .map((cat) => ({
      name: cat.category_name,
      value: cat.completed_tasks,
      color: getCategoryColorHex(cat.color),
    }));

  const COLORS = pieData.map((item) => item.color);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mb-1">History Vault</h1>
        <p className="text-muted text-sm mb-8">Your legacy of consistency.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="card-game p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Momentum</p>
              <p className="text-4xl font-heading font-extrabold">{(summary?.total_momentum ?? 0).toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <Zap size={28} className="text-accent" />
            </div>
          </div>
          <div className="card-game p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Current Streak</p>
              <p className="text-4xl font-heading font-extrabold text-primary">{summary?.current_streak ?? 0} Days</p>
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
                  Completion: {Math.round(summary?.completion_rate ?? 0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* All-time */}
          <div className="card-game p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">All-Time</p>
            <p className="text-3xl font-heading font-extrabold mb-2">{stats?.alltime_completion_rate ?? 0}%</p>
            <p className="text-xs text-muted">
              {stats?.alltime_completed_tasks}/{stats?.alltime_total_tasks} tasks completed
            </p>
          </div>

          {/* This Month */}
          <div className="card-game p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">This Month</p>
            <p className="text-3xl font-heading font-extrabold mb-2">{stats?.month_completion_rate ?? 0}%</p>
            <p className="text-xs text-muted">
              {stats?.month_completed_tasks}/{stats?.month_total_tasks} tasks completed
            </p>
          </div>

          {/* This Week */}
          <div className="card-game p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">This Week</p>
            <p className="text-3xl font-heading font-extrabold mb-2">{stats?.week_completion_rate ?? 0}%</p>
            <p className="text-xs text-muted">
              {stats?.week_completed_tasks}/{stats?.week_total_tasks} tasks completed
            </p>
          </div>

          {/* Today */}
          <div className="card-game p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Today</p>
            <p className="text-3xl font-heading font-extrabold mb-2">{stats?.day_completion_rate ?? 0}%</p>
            <p className="text-xs text-muted">
              {stats?.day_completed_tasks}/{stats?.day_total_tasks} tasks completed
            </p>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        {pieData.length > 0 && (
          <div className="card-game p-5 sm:p-6">
            <h2 className="text-lg font-heading font-extrabold mb-6">Category Breakdown (All-Time)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
