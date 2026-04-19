import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ProgressBar from "@/components/ProgressBar";
import TaskCard from "@/components/TaskCard";
import CategoryCard from "@/components/CategoryCard";
import QuickAddModal from "@/components/QuickAddModal";
import { useAppState } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { categoryPath } from "@/lib/utils";

export default function Index() {
  const store = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [floatAnim, setFloatAnim] = useState<string | null>(null);

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good Morning" : today.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const handleToggle = (id: string) => {
    const task = store.tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setFloatAnim(id);
      setTimeout(() => setFloatAnim(null), 1000);
    }
    store.toggleTask(id);
  };

  const activeTasks = store.tasks.filter(t => !t.completed);
  const completedTasks = store.tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
        {/* Greeting */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold break-words">{greeting}, {user?.name || "Builder"}!</h1>
            <p className="text-muted text-sm mt-1">{dateStr} • Let's build momentum.</p>
          </div>
          <div className="sm:text-right">
            <span className="text-xl sm:text-2xl font-heading font-extrabold text-primary">{store.progressPercent}%</span>
            <span className="text-xs sm:text-sm font-heading font-bold text-muted ml-1">Daily Goal</span>
            <p className="text-xs text-muted uppercase tracking-wider">{store.completedToday}/{store.totalToday} tasks completed today</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-7 sm:mb-10 relative">
          <ProgressBar percent={store.progressPercent} />
          <AnimatePresence>
            {floatAnim && (
              <motion.span
                className="absolute right-4 -top-2 text-primary font-heading font-bold text-lg pointer-events-none"
                initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }} exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                +5
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Tasks */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-heading font-extrabold mb-4">Today's Tasks & Habits</h2>
            {activeTasks.length === 0 && completedTasks.length === 0 ? (
              <div className="card-game p-10 text-center">
                <p className="text-muted text-lg font-heading font-bold">No momentum built yet today!</p>
                <motion.button
                  className="mt-4 px-6 py-3 rounded-inner border-game bg-primary text-primary-foreground font-heading font-bold uppercase shadow-tactile btn-press"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={() => setModalOpen(true)}
                >
                  Add Your First Task
                </motion.button>
              </div>
            ) : (
              <>
                {activeTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={store.categories.find((c) => c.id === task.categoryId)}
                    onToggle={handleToggle}
                    onToggleSub={store.toggleSubTask}
                    showSubTasks
                  />
                ))}
                {completedTasks.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wider text-muted font-bold mt-6 mb-2">Completed</p>
                    {completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={store.categories.find((c) => c.id === task.categoryId)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-heading font-extrabold mb-4">Category Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
              {store.categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  tasks={store.tasks.filter((t) => t.categoryId === cat.id)}
                  onClick={() => navigate(categoryPath(cat.name))}
                />
              ))}
              <button
                onClick={() => navigate("/categories")}
                className="aspect-square rounded-game border-2 border-dashed border-muted/50 flex flex-col items-center justify-center gap-2 text-muted hover:border-foreground hover:text-foreground transition-colors"
              >
                <Plus size={24} />
                <span className="font-heading font-bold text-sm">New Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <motion.button
        className="fixed bottom-5 right-4 sm:bottom-8 sm:right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground border-game shadow-tactile flex items-center justify-center btn-press"
        onClick={() => setModalOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95, y: 4 }}
      >
        <Plus size={24} strokeWidth={3} />
      </motion.button>

      <QuickAddModal open={modalOpen} onClose={() => setModalOpen(false)} categories={store.categories} onAdd={store.addTask} />
    </div>
  );
}
