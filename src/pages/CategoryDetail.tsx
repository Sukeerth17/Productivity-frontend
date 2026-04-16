import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import TaskCard from "@/components/TaskCard";
import QuickAddModal from "@/components/QuickAddModal";
import { useAppState, getCategoryColorHex } from "@/lib/store";

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAppState();
  const [modalOpen, setModalOpen] = useState(false);

  const category = store.categories.find((c) => c.id === id);
  if (!category) return <div className="p-8 text-center font-heading text-xl">Category not found</div>;

  const tasks = store.tasks.filter((t) => t.categoryId === id);
  const completed = tasks.filter((t) => t.completed).length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const colorHex = getCategoryColorHex(category.color);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Hero */}
        <motion.div
          className="rounded-game overflow-hidden p-8 pb-10 mb-8 relative"
          style={{ background: `linear-gradient(135deg, ${colorHex}, ${colorHex}cc)` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-heading font-extrabold text-foreground mb-1">{category.name}</h1>
          <p className="font-body text-foreground/70 text-lg">{pct}% Completed</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-inner bg-primary text-primary-foreground border-game font-heading font-bold text-sm shadow-tactile btn-press"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-extrabold">Active Habits & Tasks</h2>
          <div className="flex gap-3">
            <button
              onClick={() => { store.deleteCategory(category.id); navigate("/"); }}
              className="px-4 py-2 rounded-inner border-game text-primary font-heading font-bold text-sm flex items-center gap-2 btn-press hover:bg-primary/10"
            >
              <Trash2 size={14} /> Delete Category
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-inner border-game bg-foreground text-card font-heading font-bold text-sm flex items-center gap-2 shadow-tactile btn-press"
            >
              <Plus size={14} /> Quick Add
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="card-game p-10 text-center">
            <p className="text-muted text-lg font-heading font-bold">A blank canvas. What's the first step?</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={category}
              onToggle={store.toggleTask}
              onToggleSub={store.toggleSubTask}
              onDelete={store.deleteTask}
              showSubTasks
            />
          ))
        )}
      </div>
      <QuickAddModal open={modalOpen} onClose={() => setModalOpen(false)} categories={[category]} onAdd={store.addTask} />
    </div>
  );
}
