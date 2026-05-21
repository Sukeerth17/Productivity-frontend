import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, Filter, X, Pencil, Save, CalendarClock } from "lucide-react";
import { api, type Priority, type Task } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
import { SmoothLoad } from "@/components/glass/SmoothLoad";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRIORITIES: (Priority | "all")[] = ["all", "low", "medium", "high"];

function patchTaskInLists(qc: ReturnType<typeof useQueryClient>, taskId: string, updater: (task: Task) => Task) {
  qc.setQueriesData({ queryKey: ["tasks"] }, (old: any) => {
    if (!old?.items) return old;
    return {
      ...old,
      items: old.items.map((task: Task) => (task.id === taskId ? updater(task) : task)),
    };
  });
}

export default function Tasks() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNew, setShowNew] = useState(false);
  const [filterCat, setFilterCat]           = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus, setFilterStatus]     = useState<"all" | "active" | "done">("all");
  const [filterDate, setFilterDate]         = useState<"all" | "today">("today");
  const [showFuture, setShowFuture]         = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setShowNew(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const searchFilter = searchParams.get("search") || "";

  const cats = useQuery({ queryKey: ["categories"], queryFn: api.listCategories });
  const tasks = useQuery({
    queryKey: ["tasks", { filterCat, filterPriority, filterStatus, filterDate, showFuture, searchFilter }],
    queryFn: () => api.listTasks({
      category_id:    filterCat      || undefined,
      priority:       filterPriority === "all" ? undefined : filterPriority,
      // When showing future tasks, ignore status/date filters (all future tasks regardless of completion)
      completed:      showFuture ? undefined : (filterStatus === "all" ? undefined : filterStatus === "done"),
      date_filter:    showFuture ? undefined : (filterDate  === "all" ? undefined : filterDate),
      include_future: showFuture || undefined,
      search:         searchFilter  || undefined,
      limit: 100,
    }),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => api.toggleTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = qc.getQueriesData({ queryKey: ["tasks"] });
      
      patchTaskInLists(qc, id, (task) => ({
        ...task,
        completed: !task.completed,
        progress: task.completed ? 0 : 100,
        completed_at: task.completed ? null : task.completed_at ?? new Date().toISOString(),
      }));
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["productivity"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => { toast.success("Task deleted"); qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateTask>[1] }) => api.updateTask(id, payload),
    onSuccess: () => {
      toast.success("Task updated");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["productivity"] });
    },
    onError: (e: any) => toast.error(e?.message || "Could not update task"),
  });
  const updateProgress = useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => api.updateTask(id, { progress }),
    onMutate: async ({ id, progress }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = qc.getQueriesData({ queryKey: ["tasks"] });

      patchTaskInLists(qc, id, (task) => ({
        ...task,
        progress,
        completed: progress >= 100,
        completed_at: progress >= 100 ? task.completed_at ?? new Date().toISOString() : null,
      }));

      return { previousTasks };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
      toast.error((err as Error)?.message || "Could not update progress");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["productivity"] });
    },
  });

  const grouped = useMemo(() => {
    const items = tasks.data?.items ?? [];
    return { active: items.filter((t) => !t.completed), done: items.filter((t) => t.completed) };
  }, [tasks.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Workspace</div>
          <h1 className="font-display text-3xl md:text-4xl">Tasks</h1>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNew(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow flex items-center gap-2">
          <Plus className="size-4" /> New task
        </motion.button>
      </div>

      <GlassCard className="p-4 overflow-visible border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <div className="relative flex-1 sm:max-w-xs group">
            <input
              value={searchFilter}
              onChange={(e) => {
                searchParams.set("search", e.target.value);
                setSearchParams(searchParams, { replace: true });
              }}
              placeholder="Search tasks..."
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 focus:bg-white/[0.08] transition-all duration-300 text-sm placeholder:text-white/20"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="size-3.5 text-white/40 mr-1" />
            
            {/* ── Date filter: Today / All ── */}
            {!showFuture && (
              <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                {(["all", "today"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDate(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterDate === d
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {d === "all" ? "All days" : "Today"}
                  </button>
                ))}
              </div>
            )}

            {/* ── Upcoming tasks toggle ── */}
            <button
              onClick={() => setShowFuture((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                showFuture
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}
              title={showFuture ? "Hide upcoming tasks" : "Show upcoming tasks"}
            >
              <CalendarClock className="size-3.5" />
              Upcoming
            </button>

            <Select value={filterCat || "all"} onValueChange={(v) => setFilterCat(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px] rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-9 text-xs">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                <SelectItem value="all">All categories</SelectItem>
                {cats.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | "all")}>
              <SelectTrigger className="w-[130px] rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-9 text-xs capitalize">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p === "all" ? "Any priority" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-[130px] rounded-xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/10">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
              </SelectContent>
            </Select>

            {(filterCat || filterPriority !== "all" || filterStatus !== "all" || filterDate !== "today" || showFuture || searchFilter) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setFilterCat("");
                  setFilterPriority("all");
                  setFilterStatus("all");
                  setFilterDate("all");
                  setShowFuture(false);
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="Clear filters"
              >
                <X className="size-4" />
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>

      <SmoothLoad
        isLoading={tasks.isLoading}
        loadingComponent={
          <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-16" />)}</div>
        }
      >
        {showFuture ? (
          /* ── Upcoming mode: single column, soonest first ── */
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 px-1 text-sm text-violet-300/80">
              <CalendarClock className="size-4 shrink-0" />
              <span>Showing <strong>{tasks.data?.total ?? 0}</strong> upcoming task{(tasks.data?.total ?? 0) !== 1 ? "s" : ""} — ordered by start date</span>
            </div>
            <Section
              title="Upcoming"
              items={tasks.data?.items ?? []}
              cats={cats.data ?? []}
              onToggle={(id) => toggle.mutate(id)}
              onDelete={(id) => del.mutate(id)}
              onSave={(id, payload) => update.mutate({ id, payload })}
              onProgressSave={(id, progress) => updateProgress.mutate({ id, progress })}
              isSaving={update.isPending || updateProgress.isPending}
            />
          </div>
        ) : (
          /* ── Normal mode: Active / Completed split ── */
          <div className="grid lg:grid-cols-2 gap-6">
            <Section
              title="Active"
              items={grouped.active}
              cats={cats.data ?? []}
              onToggle={(id) => toggle.mutate(id)}
              onDelete={(id) => del.mutate(id)}
              onSave={(id, payload) => update.mutate({ id, payload })}
              onProgressSave={(id, progress) => updateProgress.mutate({ id, progress })}
              isSaving={update.isPending || updateProgress.isPending}
            />
            <Section
              title="Completed"
              items={grouped.done}
              cats={cats.data ?? []}
              onToggle={(id) => toggle.mutate(id)}
              onDelete={(id) => del.mutate(id)}
              onSave={(id, payload) => update.mutate({ id, payload })}
              onProgressSave={(id, progress) => updateProgress.mutate({ id, progress })}
              isSaving={update.isPending || updateProgress.isPending}
            />
          </div>
        )}
      </SmoothLoad>

      <AnimatePresence>
        {showNew && <NewTaskModal onClose={() => setShowNew(false)} categories={cats.data ?? []} />}
      </AnimatePresence>
    </div>
  );
}


function Section({ title, items, cats, onToggle, onDelete, onSave, onProgressSave, isSaving }: {
  title: string; items: Task[]; cats: { id: string; name: string; color: string }[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, payload: {
    title: string;
    category_id: string;
    notes: string | null;
    priority: Priority | null;
    due_time: string | null;
    is_habit: boolean;
    start_date: string | null;
    habit_days: number[] | null;
  }) => void;
  onProgressSave: (id: string, progress: number) => void;
  isSaving: boolean;
}) {
  return (
    <GlassCard>
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-display text-xl">{title}</div>
        <div className="text-xs text-muted-foreground">{items.length} items</div>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center">Nothing here.</div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((t) => {
              const cat = cats.find((c) => c.id === t.category_id);
              return (
                <TaskListItem
                  key={t.id}
                  task={t}
                  cat={cat}
                  cats={cats}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onSave={onSave}
                  onProgressSave={onProgressSave}
                  isSaving={isSaving}
                />
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </GlassCard>
  );
}
