import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, Filter, X, Pencil, Save } from "lucide-react";
import { api, type Priority, type Task } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { toast } from "sonner";

const PRIORITIES: (Priority | "all")[] = ["all", "low", "medium", "high"];

export default function Tasks() {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNew, setShowNew] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "done">("all");

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
    queryKey: ["tasks", { filterCat, filterPriority, filterStatus, searchFilter }],
    queryFn: () => api.listTasks({
      category_id: filterCat || undefined,
      priority: filterPriority === "all" ? undefined : filterPriority,
      completed: filterStatus === "all" ? undefined : filterStatus === "done",
      search: searchFilter || undefined,
      limit: 100,
    }),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => api.toggleTask(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); qc.invalidateQueries({ queryKey: ["productivity"] }); },
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

      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <input
            value={searchFilter}
            onChange={(e) => {
              searchParams.set("search", e.target.value);
              setSearchParams(searchParams, { replace: true });
            }}
            placeholder="Search tasks..."
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 transition text-sm flex-1 sm:max-w-xs"
          />
          <span className="hidden sm:inline text-white/30">|</span>
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterCat} onChange={setFilterCat}>
            <option value="">All categories</option>
            {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={filterPriority} onChange={(v) => setFilterPriority(v as Priority | "all")}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p === "all" ? "Any priority" : p}</option>)}
          </Select>
          <Select value={filterStatus} onChange={(v) => setFilterStatus(v as any)}>
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="done">Completed</option>
          </Select>
        </div>
      </GlassCard>

      {tasks.isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-16" />)}</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Section
            title="Active"
            items={grouped.active}
            cats={cats.data ?? []}
            onToggle={(id) => toggle.mutate(id)}
            onDelete={(id) => del.mutate(id)}
            onSave={(id, payload) => update.mutate({ id, payload })}
            isSaving={update.isPending}
          />
          <Section
            title="Completed"
            items={grouped.done}
            cats={cats.data ?? []}
            onToggle={(id) => toggle.mutate(id)}
            onDelete={(id) => del.mutate(id)}
            onSave={(id, payload) => update.mutate({ id, payload })}
            isSaving={update.isPending}
          />
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewTaskModal onClose={() => setShowNew(false)} categories={cats.data ?? []} />}
      </AnimatePresence>
    </div>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-primary/60">
      {children}
    </select>
  );
}

function Section({ title, items, cats, onToggle, onDelete, onSave, isSaving }: {
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
  }) => void;
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
