import { useState, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Loader2, Save } from "lucide-react";
import { type Task, type Priority } from "@/lib/api";

type EditDraft = {
  title: string;
  categoryId: string;
  notes: string;
  priority: Priority | "";
  dueTime: string;
  taskType: "habit" | "one-off";
  startDate: string;
  habitDays: number[];
};

function makeDraft(task: Task): EditDraft {
  return {
    title: task.title,
    categoryId: task.category_id,
    notes: task.notes ?? "",
    priority: task.priority ?? "",
    dueTime: task.due_time ?? "",
    taskType: task.is_habit ? "habit" : "one-off",
    startDate: task.start_date ?? "",
    habitDays: task.habit_days ?? [],
  };
}

export function TaskListItem({
  task,
  cat,
  cats,
  onToggle,
  onDelete,
  onSave,
  onProgressSave,
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
    start_date: string | null;
    habit_days: number[] | null;
  }) => void;
  onProgressSave: (id: string, progress: number) => void;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditDraft>(() => makeDraft(task));
  const [progress, setProgress] = useState<number>(task.progress ?? 0);
  const [inputVal, setInputVal] = useState<string>(String(task.progress ?? 0));

  // Sync when task.progress changes from outside (e.g. after toggle)
  useEffect(() => {
    setProgress(task.progress ?? 0);
    setInputVal(String(task.progress ?? 0));
  }, [task.progress]);

  useEffect(() => {
    if (!isEditing) setDraft(makeDraft(task));
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
      start_date: draft.startDate || null,
      habit_days: draft.taskType === "habit" ? (draft.habitDays.length > 0 ? draft.habitDays : null) : null,
    });
    setIsEditing(false);
  };

  const handleToggle = () => {
    // Optimistically update progress
    const next = task.completed ? 0 : 100;
    setProgress(next);
    setInputVal(String(next));
    onToggle(task.id);
  };

  const handleProgressInput = (raw: string) => {
    setInputVal(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      const clamped = Math.min(100, Math.max(0, n));
      setProgress(clamped);
    }
  };

  const handleProgressBlur = () => {
    const n = parseInt(inputVal, 10);
    const clamped = isNaN(n) ? progress : Math.min(100, Math.max(0, n));
    setProgress(clamped);
    setInputVal(String(clamped));

    if (clamped !== task.progress) {
      onProgressSave(task.id, clamped);
    }
  };

  const handleProgressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  const progressColor =
    progress === 100
      ? "from-emerald-500 to-green-400"
      : progress >= 60
      ? "from-primary to-violet-400"
      : progress >= 30
      ? "from-amber-500 to-yellow-400"
      : "from-rose-500 to-orange-400";

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
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Start Date</div>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft((c) => ({ ...c, startDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60"
            />
          </div>

          {draft.taskType === "habit" && (
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">Habit Schedule</div>
              <div className="flex gap-1 flex-wrap">
                {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDraft(d => ({
                      ...d,
                      habitDays: d.habitDays.includes(i) ? d.habitDays.filter(x => x !== i) : [...d.habitDays, i]
                    }))}
                    className={`size-8 rounded-lg text-[10px] border transition ${
                      draft.habitDays.includes(i)
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground italic">
                {draft.habitDays.length === 0 ? "Repeats daily" : "Repeats on selected days"}
              </div>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={handleCancel} className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/10">
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
        <div className="space-y-2">
          {/* Top row: checkbox + title + actions */}
          <div className="flex items-center gap-3">
            {/* Checkbox + % stacked */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                onClick={handleToggle}
                className={`size-5 rounded-md border transition ${task.completed ? "bg-gradient-primary border-transparent" : "border-foreground/20 hover:border-primary"}`}
                aria-label="Toggle"
              >
                {task.completed && (
                  <svg viewBox="0 0 24 24" className="size-4 mx-auto text-primary-foreground">
                    <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z"/>
                  </svg>
                )}
              </button>
              {/* Editable % */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={inputVal}
                  onChange={(e) => handleProgressInput(e.target.value)}
                  onKeyDown={handleProgressKeyDown}
                  onBlur={handleProgressBlur}
                  className="w-11 text-xs font-medium text-center bg-transparent border-b border-white/20 focus:border-primary outline-none text-muted-foreground leading-none py-0.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-xs font-medium text-muted-foreground">%</span>
              </div>
            </div>

            {/* Title + meta */}
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
                {task.start_date && new Date(task.start_date) > new Date(new Date().toDateString()) && (
                  <span className="inline-flex items-center gap-1 text-primary/80 font-medium">
                    • ⏰ Starts {new Date(task.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {task.is_habit && task.habit_days && task.habit_days.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    • 🔄 {task.habit_days.map(d => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d]).join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
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

          {/* Progress bar */}
          <AnimatePresence>
            <div className="ml-9 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </AnimatePresence>
        </div>
      )}
    </motion.li>
  );
}
