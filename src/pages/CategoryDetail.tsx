import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, Plus, Tag, Loader2, Filter } from "lucide-react";
import { api, type Priority, type Task, type Category } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
import { TaskListItem } from "@/components/tasks/TaskListItem";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { toast } from "sonner";

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "done">("all");

  const cats = useQuery({ queryKey: ["categories"], queryFn: api.listCategories });
  const category = useMemo(() => cats.data?.find((c) => c.id === id), [cats.data, id]);

  const tasks = useQuery({
    queryKey: ["tasks", { category_id: id, filterStatus }],
    queryFn: () => api.listTasks({
      category_id: id,
      completed: filterStatus === "all" ? undefined : filterStatus === "done",
      limit: 100,
    }),
    enabled: !!id,
  });

  const toggle = useMutation({
    mutationFn: (tid: string) => api.toggleTask(tid),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["tasks"] }); 
      qc.invalidateQueries({ queryKey: ["dashboard"] }); 
      qc.invalidateQueries({ queryKey: ["productivity"] }); 
    },
  });

  const delTask = useMutation({
    mutationFn: (tid: string) => api.deleteTask(tid),
    onSuccess: () => { toast.success("Task deleted"); qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });

  const updateTask = useMutation({
    mutationFn: ({ tid, payload }: { tid: string; payload: any }) => api.updateTask(tid, payload),
    onSuccess: () => {
      toast.success("Task updated");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["productivity"] });
    },
  });

  const delCat = useMutation({
    mutationFn: () => api.deleteCategory(id!),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
      navigate("/categories");
    },
    onError: (e: any) => toast.error(e?.message || "Could not delete category"),
  });

  if (cats.isLoading || (id && !category && !cats.isError)) {
    return (
      <div className="space-y-6">
        <Shimmer className="h-10 w-32" />
        <Shimmer className="h-40 w-full" />
        <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-16" />)}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <div className="text-xl font-display mb-4">Category not found</div>
        <button onClick={() => navigate("/categories")} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          Go back to categories
        </button>
      </div>
    );
  }

  const items = tasks.data?.items ?? [];
  const activeCount = items.filter(t => !t.completed).length;
  const doneCount = items.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/categories")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Back to Categories
        </button>
        <div className="flex gap-2">
           <button onClick={() => delCat.mutate()} className="size-9 grid place-items-center rounded-lg hover:bg-destructive/30 text-muted-foreground hover:text-destructive transition shadow-glow border border-white/5 bg-white/5">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <GlassCard className="relative overflow-hidden p-8">
        <div className="absolute -top-24 -right-24 size-64 rounded-full opacity-20 blur-3xl" style={{ background: category.color }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-3xl grid place-items-center shadow-glow-lg" style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}aa)` }}>
              <Tag className="size-8" style={{ color: "hsl(30 25% 8%)" }} />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl">{category.name}</h1>
              <p className="text-muted-foreground mt-1">{items.length} total tasks · {activeCount} active</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowNew(true)}
            className="px-5 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow flex items-center justify-center gap-2">
            <Plus className="size-5" /> Add Task
          </motion.button>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
          <button onClick={() => setFilterStatus("all")} className={`px-4 py-1.5 rounded-lg text-sm transition ${filterStatus === "all" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>All</button>
          <button onClick={() => setFilterStatus("active")} className={`px-4 py-1.5 rounded-lg text-sm transition ${filterStatus === "active" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Active</button>
          <button onClick={() => setFilterStatus("done")} className={`px-4 py-1.5 rounded-lg text-sm transition ${filterStatus === "done" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Completed</button>
        </div>
      </div>

      {tasks.isLoading ? (
        <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Shimmer key={i} className="h-16" />)}</div>
      ) : items.length === 0 ? (
        <GlassCard className="text-center py-20">
          <div className="size-12 mx-auto rounded-2xl bg-white/5 border border-white/10 grid place-items-center mb-4">
            <Filter className="size-5 text-muted-foreground" />
          </div>
          <div className="font-display text-xl">No tasks found</div>
          <p className="text-sm text-muted-foreground mt-1">Try changing filters or add a new task to this category.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {items.map((t) => (
              <TaskListItem
                key={t.id}
                task={t}
                cat={category}
                cats={cats.data ?? []}
                onToggle={(tid) => toggle.mutate(tid)}
                onDelete={(tid) => delTask.mutate(tid)}
                onSave={(tid, payload) => updateTask.mutate({ tid, payload })}
                isSaving={updateTask.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showNew && (
          <NewTaskModal 
            onClose={() => setShowNew(false)} 
            categories={cats.data ?? []} 
            defaultCategoryId={id} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
