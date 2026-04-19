import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import TaskCard from "@/components/TaskCard";
import QuickAddModal from "@/components/QuickAddModal";
import { getCategories, getTasks } from "@/lib/api";
import { categoryPath, slugify } from "@/lib/utils";
import { getCategoryColorHex, mapCategory, mapTask, useAppState } from "@/lib/store";

export default function CategoryDetail() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const store = useAppState({ categories: false, tasks: false, dashboardStats: false });
  const [modalOpen, setModalOpen] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = useMemo(() => (categoriesQuery.data ?? []).map(mapCategory), [categoriesQuery.data]);
  const category = categories.find((c) => c.id === slugOrId)
    ?? categories.find((c) => slugify(c.name) === slugOrId);

  const categoryTasksQuery = useQuery({
    queryKey: ["tasks", { categoryId: category?.id ?? null }],
    queryFn: () => getTasks({ categoryId: category!.id, limit: 200, offset: 0 }),
    enabled: !!category,
  });

  const tasks = useMemo(
    () => (categoryTasksQuery.data?.items ?? []).map(mapTask),
    [categoryTasksQuery.data?.items],
  );

  useEffect(() => {
    if (!category || !slugOrId) return;
    const canonicalSlug = slugify(category.name);
    if (canonicalSlug && slugOrId !== canonicalSlug) {
      navigate(categoryPath(category.name), { replace: true });
    }
  }, [category, navigate, slugOrId]);

  if (categoriesQuery.isLoading) {
    return <div className="p-8 text-center font-heading text-xl">Loading category...</div>;
  }

  if (!category) {
    return <div className="p-8 text-center font-heading text-xl">Category not found</div>;
  }

  const completed = tasks.filter((task) => task.completed).length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const colorHex = getCategoryColorHex(category.color);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
        <motion.div
          className="rounded-game overflow-hidden p-5 sm:p-8 sm:pb-10 mb-6 sm:mb-8 relative"
          style={{ background: `linear-gradient(135deg, ${colorHex}, ${colorHex}cc)` }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-foreground mb-1 break-words">{category.name}</h1>
          <p className="font-body text-foreground/70 text-base sm:text-lg">{pct}% Completed</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-inner bg-primary text-primary-foreground border-game font-heading font-bold text-sm shadow-tactile btn-press"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </motion.div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-heading font-extrabold">Active Habits & Tasks</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
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

        {categoryTasksQuery.isLoading ? (
          <div className="card-game p-10 text-center">
            <p className="text-muted text-lg font-heading font-bold">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
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
