import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Loader2, Save } from "lucide-react";
import { type Task, type Priority } from "@/lib/api";

type EditDraft = {
  title: string;
  categoryId: string;
  notes: string;
  priority: Priority | "";
  dueTime: string;
  taskType: "habit" | "one-off";
};

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

export function TaskListItem({
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
