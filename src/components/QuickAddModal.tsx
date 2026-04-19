import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Category, Task } from "@/lib/store";
import { getCategoryColorHex } from "@/lib/store";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void;
}

export default function QuickAddModal({ open, onClose, categories, onAdd }: QuickAddModalProps) {
  const [title, setTitle] = useState("");
  const [catId, setCatId] = useState(categories[0]?.id || "");
  const [isHabit, setIsHabit] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    if (categories.length > 0 && !catId) {
      setCatId(categories[0].id);
    }
  }, [categories, catId]);

  const handleSubmit = () => {
    if (!title.trim() || !catId) return;
    onAdd({ title: title.trim(), categoryId: catId, completed: false, isHabit, priority, subTasks: [] });
    setTitle("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/30 px-3 py-3 sm:px-0 sm:py-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card-game w-full max-w-[420px] p-4 sm:p-6 max-h-[92vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xl font-bold">Quick Add</h3>
              <button onClick={onClose} className="p-1"><X size={20} /></button>
            </div>

            <input
              className="w-full border-game rounded-inner px-4 py-3 font-heading text-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />

            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Category</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`w-full rounded-inner border-game px-3 py-2 text-left font-heading font-bold text-sm flex items-center gap-2 transition-colors ${
                    catId === c.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                  }`}
                  onClick={() => setCatId(c.id)}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-foreground/40 shrink-0"
                    style={{ backgroundColor: getCategoryColorHex(c.color) }}
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-4">
              <button
                className={`flex-1 py-2 rounded-inner border-game font-heading font-bold text-sm btn-press ${!isHabit ? "bg-primary text-primary-foreground" : "bg-card"}`}
                onClick={() => setIsHabit(false)}
              >
                One-off Task
              </button>
              <button
                className={`flex-1 py-2 rounded-inner border-game font-heading font-bold text-sm btn-press ${isHabit ? "bg-primary text-primary-foreground" : "bg-card"}`}
                onClick={() => setIsHabit(true)}
              >
                Habit
              </button>
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Priority</p>
            <div className="flex gap-2 mb-5">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  className={`flex-1 py-2 rounded-inner border-game font-heading font-bold text-xs uppercase btn-press ${priority === p ? "bg-foreground text-card" : "bg-card"}`}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <motion.button
              className="w-full py-3 rounded-inner border-game bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider shadow-tactile btn-press"
              onClick={handleSubmit}
              disabled={!catId}
              whileTap={{ scale: 0.97 }}
            >
              {catId ? "Add Task" : "Create a category first"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
