import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
import { SmoothLoad } from "@/components/glass/SmoothLoad";
import { useAuth } from "@/store/auth";
import { CheckCircle2, ListTodo, Flame, Target, Calendar } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const hist = useQuery({ queryKey: ["history"], queryFn: api.history });
  const prod = useQuery({ queryKey: ["productivity"], queryFn: api.productivity });
  const tasks = useQuery({ queryKey: ["tasks", "recent"], queryFn: () => api.listTasks({ limit: 6 }) });

  const loadingStats = dash.isLoading || hist.isLoading;
  const loadingCharts = prod.isLoading;
  const loadingTasks = tasks.isLoading;

  const trend = prod.data
    ? [
        { name: "Day", rate: Math.round(prod.data.day_completion_rate) },
        { name: "Week", rate: Math.round(prod.data.week_completion_rate) },
        { name: "Month", rate: Math.round(prod.data.month_completion_rate) },
        { name: "All-time", rate: Math.round(prod.data.alltime_completion_rate) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-sm text-muted-foreground">Hello {user?.name?.split(" ")[0] || "there"} 👋</div>
        <h1 className="font-display text-3xl md:text-4xl">Your <span className="gradient-text">momentum</span> today</h1>
      </motion.div>

      <SmoothLoad
        isLoading={loadingStats}
        loadingComponent={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-28" />)}
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<ListTodo className="size-5" />} label="Active tasks" value={dash.data?.active_tasks ?? 0} accent />
          <Stat icon={<CheckCircle2 className="size-5" />} label="Completed" value={dash.data?.completed_tasks ?? 0} />
          <Stat icon={<Target className="size-5" />} label="Completion" value={`${Math.round(dash.data?.completion_rate ?? 0)}%`} />
          <Stat icon={<Flame className="size-5" />} label="Streak" value={`${hist.data?.current_streak ?? 0}d`} />
        </div>
      </SmoothLoad>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Completion rate</div>
              <div className="font-display text-2xl">Trend overview</div>
            </div>
            <div className="text-xs text-muted-foreground">Updated just now</div>
          </div>
          <div className="h-64">
            <SmoothLoad
              isLoading={loadingCharts}
              loadingComponent={<Shimmer className="h-full" />}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38 70% 60%)" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="hsl(42 85% 72%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border)/0.1)" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border)/0.2)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="rate" stroke="hsl(38 70% 60%)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </SmoothLoad>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm text-muted-foreground">Categories</div>
          <div className="font-display text-2xl mb-3">Top breakdown</div>
          <SmoothLoad
            isLoading={loadingCharts}
            loadingComponent={
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-10" />)}
              </div>
            }
          >
            <div className="space-y-3">
              {(prod.data?.category_breakdown ?? []).slice(0, 5).map((c) => (
                <div key={c.category_id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                      {c.category_name}
                    </div>
                    <span className="text-muted-foreground">{Math.round(c.completion_rate)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(c.completion_rate)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full" style={{ background: c.color }} />
                  </div>
                </div>
              ))}
              {(!prod.data?.category_breakdown || prod.data.category_breakdown.length === 0) && (
                <div className="text-sm text-muted-foreground">No categories yet.</div>
              )}
            </div>
          </SmoothLoad>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Recent</div>
            <div className="font-display text-xl">Latest tasks</div>
          </div>
          <Calendar className="size-4 text-muted-foreground" />
        </div>
        <SmoothLoad
          isLoading={loadingTasks}
          loadingComponent={
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-12" />)}
            </div>
          }
        >
          {(!tasks.data || tasks.data.items.length === 0) ? (
            <div className="text-sm text-muted-foreground">No tasks yet — head to <span className="text-foreground">Tasks</span> to add one.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {tasks.data.items.map((t) => (
                <li key={t.id} className="py-3 flex items-center gap-3">
                  <span className={`size-2.5 rounded-full ${t.completed ? "bg-emerald-400" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    {t.due_time && <div className="text-xs text-muted-foreground">Due {t.due_time}</div>}
                  </div>
                  {t.priority && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 capitalize">{t.priority}</span>}
                </li>
              ))}
            </ul>
          )}
        </SmoothLoad>
      </GlassCard>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <GlassCard hover className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`size-9 rounded-xl grid place-items-center ${accent ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-white/5 border border-white/10"}`}>
          {icon}
        </div>
      </div>
      <div className="font-display text-3xl mt-3">{value}</div>
    </GlassCard>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <GlassCard hover className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`size-9 rounded-xl grid place-items-center ${accent ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-white/5 border border-white/10"}`}>
          {icon}
        </div>
      </div>
      <div className="font-display text-3xl mt-3">{value}</div>
    </GlassCard>
  );
}
