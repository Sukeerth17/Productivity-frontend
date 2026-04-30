import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, Filter, X, Pencil, Save } from "lucide-react";
import { api, type Priority, type Task } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
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

type EditDraft = {
  title: string;
  categoryId: string;
  notes: string;
  priority: Priority | "";
  dueTime: string;
  taskType: "habit" | "one-off";
};

function TaskListItem({
  task,
  cat,
  cats,
  onToggle,
  onDelete,
  onSave,
  isSaving,
}: {
  task: Task;
  cat?: { id: string; name: string; color: string };
  cats: { id: string; name: string; color: string }[];
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
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditDraft>(() => makeDraft(task));

  useEffect(() => {
    if (!isEditing) {
      setDraft(makeDraft(task));
    }
  }, [task, isEditing]);

  const handleCancel = () => {
    setDraft(makeDraft(task));
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!draft.title.trim() || !draft.categoryId) return;

    onSave(task.id, {
      title: draft.title.trim(),
      category_id: draft.categoryId,
      notes: draft.notes.trim() ? draft.notes.trim() : null,
      priority: draft.priority || null,
      due_time: draft.dueTime.trim() ? draft.dueTime.trim() : null,
      is_habit: draft.taskType === "habit",
    });
    setIsEditing(false);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
      className="group glass p-3 hover:bg-white/[0.07]"
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
            placeholder="Task title"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={draft.categoryId}
              onChange={(e) => setDraft((current) => ({ ...current, categoryId: e.target.value }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60"
            >
              {cats.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select
              value={draft.taskType}
              onChange={(e) => setDraft((current) => ({ ...current, taskType: e.target.value as EditDraft["taskType"] }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60"
            >
              <option value="one-off">One-off task</option>
              <option value="habit">Habit</option>
            </select>
            <select
              value={draft.priority}
              onChange={(e) => setDraft((current) => ({ ...current, priority: e.target.value as Priority | "" }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60"
            >
              <option value="">No priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              value={draft.dueTime}
              onChange={(e) => setDraft((current) => ({ ...current, dueTime: e.target.value }))}
              placeholder="HH:MM"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60"
            />
          </div>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((current) => ({ ...current, notes: e.target.value }))}
            placeholder="Notes (optional)"
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 resize-none outline-none focus:border-primary/60"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !draft.title.trim() || !draft.categoryId}
              className="px-3 py-2 rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              <Save className="size-4" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggle(task.id)}
            className={`size-5 rounded-md border transition ${task.completed ? "bg-gradient-primary border-transparent" : "border-white/20 hover:border-primary"}`}
            aria-label="Toggle"
          >
            {task.completed && <svg viewBox="0 0 24 24" className="size-4 mx-auto text-primary-foreground"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z"/></svg>}
          </button>
          <div className="flex-1 min-w-0">
            <div className={`truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
              {cat && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: cat.color }} />
                  {cat.name}
                </span>
              )}
              <span>• {task.is_habit ? "Habit" : "One-off task"}</span>
              {task.due_time && <span>• {task.due_time}</span>}
              {task.priority && <span className="capitalize">• {task.priority}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="size-8 grid place-items-center rounded-lg hover:bg-white/10 sm:opacity-0 sm:group-hover:opacity-100 transition"
              aria-label="Edit task"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="size-8 grid place-items-center rounded-lg hover:bg-destructive/30 sm:opacity-0 sm:group-hover:opacity-100 transition"
              aria-label="Delete task"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}
    </motion.li>
  );
}

function makeDraft(task: Task): EditDraft {
  return {
    title: task.title,
    categoryId: task.category_id,
    notes: task.notes ?? "",
    priority: task.priority ?? "",
    dueTime: task.due_time ?? "",
    taskType: task.is_habit ? "habit" : "one-off",
  };
}

function NewTaskModal({ onClose, categories }: { onClose: () => void; categories: { id: string; name: string }[] }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [priority, setPriority] = useState<Priority | "">("");
  const [dueTime, setDueTime] = useState("");
  const [notes, setNotes] = useState("");
  const [newCat, setNewCat] = useState("");
  const [isHabit, setIsHabit] = useState(false);
  const [askGeneral, setAskGeneral] = useState(false);

  const createCat = useMutation({
    mutationFn: () => api.createCategory({ name: newCat.trim() }),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["categories"] }); setCategoryId(c.id); setNewCat(""); toast.success("Category created"); },
    onError: (e: any) => toast.error(e?.message || "Could not create category"),
  });

  const create = useMutation({
    mutationFn: () => api.createTask({
      title: title.trim(),
      category_id: categoryId,
      notes: notes || undefined,
      priority: (priority || null) as any,
      due_time: dueTime || null,
      is_habit: isHabit,
    }),
    onSuccess: () => { toast.success("Task added"); qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); onClose(); },
    onError: (e: any) => toast.error(e?.message || "Could not create task"),
  });

  const handleCreate = async () => {
    if (!categoryId && categories.length === 0) {
      setAskGeneral(true);
    } else {
      create.mutate();
    }
  };

  const handleAskGeneralYes = async () => {
    try {
      const c = await api.createCategory({ name: "General" });
      qc.invalidateQueries({ queryKey: ["categories"] });
      await api.createTask({
        title: title.trim(),
        category_id: c.id,
        notes: notes || undefined,
        priority: (priority || null) as any,
        due_time: dueTime || null,
        is_habit: isHabit,
      });
      toast.success("Category 'General' and task added");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
        className="glass-strong relative w-full max-w-lg p-6 space-y-4">
        <button onClick={onClose} className="absolute top-3 right-3 size-9 grid place-items-center rounded-lg hover:bg-white/10"><X className="size-4" /></button>
        {askGeneral ? (
          <div className="space-y-4">
            <div className="font-display text-2xl">Create 'General' Category?</div>
            <p className="text-sm text-muted-foreground">
              This task requires a category. Would you like to automatically create a "General" category to store it?
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-white/10 border border-white/10">
                No, cancel task
              </button>
              <button onClick={handleAskGeneralYes} className="px-4 py-2 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                Yes, create
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs text-muted-foreground">Create</div>
              <div className="font-display text-2xl">New task</div>
            </div>
            <div className="space-y-3">
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60" />

              {categories.length === 0 ? (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Create your first category</div>
                  <div className="flex gap-2">
                    <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Work"
                      className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" />
                    <button disabled={!newCat.trim() || createCat.isPending} onClick={() => createCat.mutate()}
                      className="px-3 py-2 rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-60">Add</button>
                  </div>
                </div>
              ) : (
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}

              <div className="grid grid-cols-2 gap-3">
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <option value="">No priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input value={dueTime} onChange={(e) => setDueTime(e.target.value)} placeholder="HH:MM"
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10" />
              </div>

              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 resize-none" />

              <label className="flex items-center gap-2 px-1 cursor-pointer group">
                <input type="checkbox" checked={isHabit} onChange={(e) => setIsHabit(e.target.checked)}
                  className="size-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition">Daily Habit (reloads every midnight)</span>
              </label>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}
              disabled={!title.trim() || (categories.length > 0 && !categoryId) || create.isPending}
              onClick={handleCreate}
              className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
              {create.isPending && <Loader2 className="size-4 animate-spin" />} Create task
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
