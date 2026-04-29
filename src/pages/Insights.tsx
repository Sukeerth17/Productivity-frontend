import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Insights() {
  const prod = useQuery({ queryKey: ["productivity"], queryFn: api.productivity });
  const hist = useQuery({ queryKey: ["history"], queryFn: api.history });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted-foreground">Analytics</div>
        <h1 className="font-display text-3xl md:text-4xl">Insights</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {prod.isLoading ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-28" />) : (
          <>
            <Mini label="Today" value={`${Math.round(prod.data?.day_completion_rate ?? 0)}%`} sub={`${prod.data?.day_completed_tasks}/${prod.data?.day_total_tasks}`} />
            <Mini label="This week" value={`${Math.round(prod.data?.week_completion_rate ?? 0)}%`} sub={`${prod.data?.week_completed_tasks}/${prod.data?.week_total_tasks}`} />
            <Mini label="This month" value={`${Math.round(prod.data?.month_completion_rate ?? 0)}%`} sub={`${prod.data?.month_completed_tasks}/${prod.data?.month_total_tasks}`} />
            <Mini label="All time" value={`${Math.round(prod.data?.alltime_completion_rate ?? 0)}%`} sub={`${prod.data?.alltime_completed_tasks}/${prod.data?.alltime_total_tasks}`} />
          </>
        )}
      </div>

      <GlassCard>
        <div className="font-display text-xl mb-3">Category breakdown</div>
        <div className="h-72">
          {prod.isLoading ? <Shimmer className="h-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(prod.data?.category_breakdown ?? []).map(c => ({ name: c.category_name, completed: c.completed_tasks, total: c.total_tasks, color: c.color }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border)/0.1)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip cursor={false} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border)/0.2)", borderRadius: 12 }} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="hsl(30 12% 22%)" />
                <Bar dataKey="completed" radius={[8, 8, 0, 0]} fill="hsl(38 70% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard>
          <div className="text-sm text-muted-foreground">Streak</div>
          <div className="font-display text-4xl mt-1">{hist.data?.current_streak ?? 0} <span className="text-base text-muted-foreground">days</span></div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-muted-foreground">Total momentum</div>
          <div className="font-display text-4xl mt-1">{hist.data?.total_momentum ?? 0}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-muted-foreground">Since</div>
          <div className="font-display text-2xl mt-1">{hist.data ? new Date(hist.data.started_at).toLocaleDateString() : "—"}</div>
        </GlassCard>
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <GlassCard hover className="p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </GlassCard>
  );
}
