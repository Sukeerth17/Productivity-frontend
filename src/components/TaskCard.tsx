import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import type { Task, SubTask, Category } from "@/lib/store";
import { getCategoryColorHex } from "@/lib/store";

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onToggleSub?: (taskId: string, subId: string) => void;
  onDelete?: (id: string) => void;
  showSubTasks?: boolean;
}

export default function TaskCard({ task, category, onToggle, onToggleSub, onDelete, showSubTasks = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colorHex = category ? getCategoryColorHex(category.color) : "#8D99AE";
  const hasSubTasks = task.subTasks.length > 0;
  const completedSubs = task.subTasks.filter((s) => s.completed).length;

  const priorityColors: Record<string, string> = {
    high: "#FF6B6B",
    medium: "#FFE66D",
    low: "#4ECDC4",
  };

  return (
    <div className="mb-3">
      <motion.div
        className={`card-game flex items-center gap-3 px-4 py-4 relative overflow-hidden ${task.completed ? "opacity-60" : ""}`}
        whileHover={{ y: -2 }}
        whileTap={{ y: 4, boxShadow: "0 2px 0px rgba(43,45,66,0.1)" }}
      >
        {/* Category color bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 rounded-l-game"
          style={{ backgroundColor: colorHex }}
        />

        {/* Checkbox */}
        <motion.button
          className="ml-3 w-7 h-7 rounded-full border-game flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: task.completed ? colorHex : "transparent" }}
          onClick={() => onToggle(task.id)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          {task.completed && <Check size={14} className="text-foreground" strokeWidth={3} />}
        </motion.button>

        <div className="flex-1 min-w-0">
          <p className={`font-heading font-bold text-base ${task.completed ? "line-through text-muted" : ""}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted">
            {category && <span>{category.name}</span>}
            {task.isHabit && <span>• Habit</span>}
            {hasSubTasks && <span>• Sub-tasks: {completedSubs}/{task.subTasks.length}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {task.priority && (
            <span
              className="text-xs font-heading font-bold uppercase px-2 py-0.5 rounded-inner"
              style={{ backgroundColor: priorityColors[task.priority] + "30", color: priorityColors[task.priority] }}
            >
              {task.priority}
            </span>
          )}
          {task.dueTime && (
            <span className="flex items-center gap-1 text-xs text-primary font-bold">
              <Clock size={12} /> {task.dueTime}
            </span>
          )}
          {hasSubTasks && showSubTasks && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-inner hover:bg-secondary transition-colors"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={18} />
              </motion.div>
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(task.id)} className="p-1 text-muted hover:text-primary transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Sub-tasks */}
      <AnimatePresence>
        {expanded && showSubTasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-10 pl-6 border-l-2 border-foreground/20 py-2 space-y-2">
              {task.subTasks.map((sub) => (
                <SubTaskRow key={sub.id} sub={sub} color={colorHex} onToggle={() => onToggleSub?.(task.id, sub.id)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubTaskRow({ sub, color, onToggle }: { sub: SubTask; color: string; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        className="w-5 h-5 rounded-full border-game flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: sub.completed ? color : "transparent" }}
        onClick={onToggle}
        whileTap={{ scale: 0.85 }}
      >
        {sub.completed && <Check size={10} className="text-foreground" strokeWidth={3} />}
      </motion.button>
      <span className={`text-sm font-body ${sub.completed ? "line-through text-muted" : ""}`}>
        {sub.title}
      </span>
    </div>
  );
}
