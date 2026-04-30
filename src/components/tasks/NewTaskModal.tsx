import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { api, type Priority } from "@/lib/api";
import { toast } from "sonner";

export function NewTaskModal({ 
  onClose, 
  categories, 
  defaultCategoryId 
}: { 
  onClose: () => void; 
  categories: { id: string; name: string }[];
  defaultCategoryId?: string;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || "");
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
    onSuccess: () => { 
      toast.success("Task added"); 
      qc.invalidateQueries({ queryKey: ["tasks"] }); 
      qc.invalidateQueries({ queryKey: ["dashboard"] }); 
      qc.invalidateQueries({ queryKey: ["productivity"] });
      onClose(); 
    },
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
      qc.invalidateQueries({ queryKey: ["productivity"] });
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
