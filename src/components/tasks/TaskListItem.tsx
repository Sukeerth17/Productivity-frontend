import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Loader2, Save, Check } from "lucide-react";
import { type Task, type Priority } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

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
    title:      task.title,
    categoryId: task.category_id,
    notes:      task.notes ?? "",
    priority:   task.priority ?? "",
    dueTime:    task.due_time ?? "",
    taskType:   task.is_habit ? "habit" : "one-off",
    startDate:  task.start_date ?? "",
    habitDays:  task.habit_days ?? [],
  };
}

function getDisplayProgress(task: Task): number {
  if (task.completed) return 100;
  return task.progress ?? 0;
}

// Colour-coded priority pills
const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  low:    { label: "Low",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  medium: { label: "Medium", cls: "bg-amber-500/15  text-amber-400  border-amber-500/25"  },
  high:   { label: "High",   cls: "bg-rose-500/15   text-rose-400   border-rose-500/25"   },
};

// ── Component ─────────────────────────────────────────────────────────────────

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
  onToggle:       (id: string) => void;
  onDelete:       (id: string) => void;
  onSave:         (id: string, payload: {
    title: string; category_id: string; notes: string | null;
    priority: Priority | null; due_time: string | null;
    is_habit: boolean; start_date: string | null; habit_days: number[] | null;
  }) => void;
  onProgressSave: (id: string, progress: number) => void;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState<EditDraft>(() => makeDraft(task));
  const [progress, setProgress]   = useState<number>(() => getDisplayProgress(task));
  const [inputVal, setInputVal]   = useState<string>(() => String(getDisplayProgress(task)));
  const inputRef                  = useRef<HTMLInputElement>(null);

  // Sync state when task changes from outside
  useEffect(() => {
    const next = getDisplayProgress(task);
    setProgress(next);
    setInputVal(String(next));
  }, [task.progress, task.completed]);

  useEffect(() => {
    if (!isEditing) setDraft(makeDraft(task));
  }, [task, isEditing]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCancel = () => { setDraft(makeDraft(task)); setIsEditing(false); };

  const handleSave = () => {
    if (!draft.title.trim() || !draft.categoryId) return;
    onSave(task.id, {
      title:       draft.title.trim(),
      category_id: draft.categoryId,
      notes:       draft.notes.trim() || null,
      priority:    draft.priority || null,
      due_time:    draft.dueTime.trim() || null,
      is_habit:    draft.taskType === "habit",
      start_date:  draft.startDate || null,
      habit_days:  draft.taskType === "habit" ? (draft.habitDays.length > 0 ? draft.habitDays : null) : null,
    });
    setIsEditing(false);
  };

  const handleToggle = () => {
    const next = task.completed ? 0 : 100;
    setProgress(next);
    setInputVal(String(next));
    onToggle(task.id);
  };

  // ── Progress input ─────────────────────────────────────────────────────────
  // FIX: select-all on focus so "0" is immediately replaced when user types
  const handleProgressFocus = () => inputRef.current?.select();

  const handleProgressInput = (raw: string) => {
    let sanitized = raw.replace(/^0+(?=\d)/, '');
    if (sanitized === '') sanitized = '0';
    setInputVal(sanitized);
    const n = parseInt(sanitized, 10);
    if (!isNaN(n)) setProgress(Math.min(100, Math.max(0, n)));
  };

  const handleProgressBlur = () => {
    const n       = parseInt(inputVal, 10);
    const clamped = isNaN(n) ? progress : Math.min(100, Math.max(0, n));
    setProgress(clamped);
    setInputVal(String(clamped));
    if (clamped !== getDisplayProgress(task)) onProgressSave(task.id, clamped);
  };

  const handleProgressKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  // ── Visuals ────────────────────────────────────────────────────────────────
  const progressColor =
    progress === 100 ? "from-emerald-500 to-green-400"
    : progress >= 60  ? "from-violet-500 to-primary"
    : progress >= 30  ? "from-amber-500 to-yellow-400"
    :                   "from-rose-500 to-orange-400";

  const priorityCfg = task.priority ? PRIORITY_CONFIG[task.priority] : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
      className="group relative glass rounded-xl overflow-hidden transition-colors hover:bg-white/[0.06]"
    >
      {isEditing ? (
        /* ══════════════════ EDIT MODE ══════════════════ */
        <div className="p-4 space-y-3">
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Task title"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={draft.categoryId}
              onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 text-sm"
            >
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={draft.taskType}
              onChange={(e) => setDraft((d) => ({ ...d, taskType: e.target.value as EditDraft["taskType"] }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 text-sm"
            >
              <option value="one-off">One-off task</option>
              <option value="habit">Habit</option>
            </select>
            <select
              value={draft.priority}
              onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as Priority | "" }))}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 text-sm"
            >
              <option value="">No priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              value={draft.dueTime}
              onChange={(e) => setDraft((d) => ({ ...d, dueTime: e.target.value }))}
              placeholder="HH:MM"
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 text-sm"
            />
          </div>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 resize-none outline-none focus:border-primary/60 text-sm"
          />
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Start Date</div>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 text-sm"
            />
          </div>

          {draft.taskType === "habit" && (
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">Habit Schedule</div>
              <div className="flex gap-1.5 flex-wrap">
                {["M","T","W","T","F","S","S"].map((label, i) => (
                  <button
                    key={i} type="button"
                    onClick={() => setDraft((d) => ({
                      ...d,
                      habitDays: d.habitDays.includes(i)
                        ? d.habitDays.filter((x) => x !== i)
                        : [...d.habitDays, i],
                    }))}
                    className={`size-8 rounded-lg text-[10px] font-medium border transition ${
                      draft.habitDays.includes(i)
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                    }`}
                  >{label}</button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground italic">
                {draft.habitDays.length === 0 ? "Repeats daily" : "Repeats on selected days"}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/10 transition"
            >Cancel</button>
            <button
              onClick={handleSave}
              disabled={isSaving || !draft.title.trim() || !draft.categoryId}
              className="px-4 py-2 rounded-xl text-sm bg-gradient-primary text-primary-foreground disabled:opacity-60 flex items-center gap-2 transition"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════════ VIEW MODE ══════════════════ */
        <div className="px-3 py-3">

          {/* ── Main content row ───────────────────────── */}
          <div className="flex items-center gap-3">

            {/* Completion checkbox */}
            <button
              onClick={handleToggle}
              aria-label="Toggle task"
              className={`shrink-0 size-[22px] rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                task.completed
                  ? "bg-gradient-primary border-transparent shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                  : "border-white/20 hover:border-primary/60 hover:bg-primary/10"
              }`}
            >
              {task.completed && <Check className="size-3.5 text-white" strokeWidth={3} />}
            </button>

            {/* Title + tag row */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium break-words leading-tight ${
                task.completed ? "line-through text-muted-foreground/50" : "text-foreground"
              }`}>
                {task.title}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {/* Category */}
                {cat && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    {cat.name}
                  </span>
                )}

                {cat && <span className="text-white/15 text-[10px] select-none">·</span>}

                {/* Task type */}
                <span className="text-[11px] text-muted-foreground">
                  {task.is_habit ? "Habit" : "One-off"}
                </span>

                {/* Priority pill */}
                {priorityCfg && (
                  <>
                    <span className="text-white/15 text-[10px] select-none">·</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${priorityCfg.cls}`}>
                      {priorityCfg.label}
                    </span>
                  </>
                )}

                {/* Due time */}
                {task.due_time && (
                  <>
                    <span className="text-white/15 text-[10px] select-none">·</span>
                    <span className="text-[11px] text-muted-foreground">{task.due_time}</span>
                  </>
                )}

                {/* Habit days abbreviations */}
                {task.is_habit && task.habit_days && task.habit_days.length > 0 && (
                  <>
                    <span className="text-white/15 text-[10px] select-none">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      {task.habit_days.map((d) => ["Mo","Tu","We","Th","Fr","Sa","Su"][d]).join(" ")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Progress % pill — FIX: selects all on focus so "0" is cleared immediately */}
            <div className="shrink-0 flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 hover:border-white/20 transition-colors">
              <input
                ref={inputRef}
                type="number"
                min={0}
                max={100}
                value={inputVal}
                onChange={(e) => handleProgressInput(e.target.value)}
                onFocus={handleProgressFocus}
                onKeyDown={handleProgressKeyDown}
                onBlur={handleProgressBlur}
                disabled={task.completed}
                className="w-8 text-xs font-semibold text-center bg-transparent outline-none text-foreground leading-none disabled:opacity-40
                  [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-[11px] font-medium text-muted-foreground">%</span>
            </div>

            {/* Edit / Delete — fade in on row hover */}
            <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => setIsEditing(true)}
                aria-label="Edit task"
                className="size-8 grid place-items-center rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
                className="size-8 grid place-items-center rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* ── Progress bar — full width under the row ─ */}
          <div className="mt-3 h-1 rounded-full bg-white/[0.07] overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.li>
  );
}
