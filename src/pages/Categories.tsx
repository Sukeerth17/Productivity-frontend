import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, X, Loader2, Tag, Check } from "lucide-react";
import { api, type Category } from "@/lib/api";
import { GlassCard } from "@/components/glass/GlassCard";
import { Shimmer } from "@/components/glass/Skeleton";
import { SmoothLoad } from "@/components/glass/SmoothLoad";
import { toast } from "sonner";

const PALETTE = [
  "#D4A24C", "#B5895A", "#8C6A3F", "#3FA37A", "#2F8F6E",
  "#6E8B6E", "#A36B3F", "#C97B4A", "#7A6A55", "#9C8B6E",
];

const ICONS = ["star", "tag", "briefcase", "heart", "book", "leaf", "flame", "compass", "moon", "sun"];

export default function Categories() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const cats = useQuery({ queryKey: ["categories"], queryFn: api.listCategories });
  const tasks = useQuery({ queryKey: ["tasks", "all-for-cats"], queryFn: () => api.listTasks({ limit: 200 }) });
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    (tasks.data?.items ?? []).forEach((t) => {
      const c = map.get(t.category_id) ?? { total: 0, done: 0 };
      c.total += 1; if (t.completed) c.done += 1;
      map.set(t.category_id, c);
    });
    return map;
  }, [tasks.data]);

  const del = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["categories"] });
      const previous = qc.getQueryData(["categories"]);
      qc.setQueryData(["categories"], (old: any) => old?.filter((c: any) => c.id !== id));
      return { previous };
    },
    onError: (e: any, id, context) => { toast.error(e?.message || "Could not delete"); qc.setQueryData(["categories"], context?.previous); },
    onSettled: () => { qc.invalidateQueries({ queryKey: ["categories"] }); qc.invalidateQueries({ queryKey: ["tasks"] }); },
    onSuccess: () => { toast.success("Category deleted"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Workspace</div>
          <h1 className="font-display text-3xl md:text-4xl">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Curate the spaces where your work lives.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNew(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow flex items-center gap-2">
          <Plus className="size-4" /> New category
        </motion.button>
      </div>

      <SmoothLoad
        isLoading={cats.isLoading}
        loadingComponent={
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Shimmer key={i} className="h-40" />)}
          </div>
        }
      >
        {(cats.data?.length ?? 0) === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="size-14 mx-auto rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4">
              <Tag className="size-6 text-primary-foreground" />
            </div>
            <div className="font-display text-2xl">No categories yet</div>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create your first to start organising tasks.</p>
            <button onClick={() => setShowNew(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">Create category</button>
          </GlassCard>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {cats.data!.map((c) => {
                const k = counts.get(c.id) ?? { total: 0, done: 0 };
                const pct = k.total ? Math.round((k.done / k.total) * 100) : 0;
                return (
                  <motion.div key={c.id} layout
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <GlassCard hover className="relative overflow-hidden p-6 cursor-pointer group/card"
                      onClick={() => navigate(`/categories/${c.id}`)}>
                      <div className="absolute -top-16 -right-16 size-40 rounded-full opacity-30 blur-2xl"
                        style={{ background: c.color }} />
                      <div className="flex items-start justify-between relative">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-2xl grid place-items-center shadow-glow group-hover/card:scale-110 transition"
                            style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}aa)` }}>
                            <Tag className="size-5" style={{ color: "hsl(30 25% 8%)" }} />
                          </div>
                          <div>
                            <div className="font-display text-lg leading-tight group-hover/card:text-primary transition">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{k.total} task{k.total === 1 ? "" : "s"}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 relative z-10" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setEditing(c)}
                            className="size-9 grid place-items-center rounded-lg hover:bg-white/10 transition" title="Edit">
                            <Pencil className="size-4" />
                          </button>
                          <button onClick={() => del.mutate(c.id)}
                            className="size-9 grid place-items-center rounded-lg hover:bg-destructive/30 transition" title="Delete">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 relative">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>Completion</span><span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${c.color}, hsl(38 70% 60%))` }} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">{k.done} done · {k.total - k.done} active</div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </SmoothLoad>

      <AnimatePresence>
        {showNew && <CategoryModal onClose={() => setShowNew(false)} />}
        {editing && <CategoryModal onClose={() => setEditing(null)} initial={editing} />}
      </AnimatePresence>
    </div>
  );
}

function CategoryModal({ onClose, initial }: { onClose: () => void; initial?: Category }) {
  const qc = useQueryClient();
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || PALETTE[0]);
  const [icon, setIcon] = useState(initial?.icon || "star");

  const create = useMutation({
    mutationFn: () => api.createCategory({ name: name.trim(), color, icon }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["categories"] });
      const previous = qc.getQueryData(["categories"]);
      const tempId = `temp-${Date.now()}`;
      qc.setQueryData(["categories"], (old: any) => [...(old || []), { id: tempId, name: name.trim(), color, icon, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
      onClose(); // close modal instantly
      return { previous };
    },
    onError: (e: any, variables, context) => { toast.error(e?.message || "Could not create"); qc.setQueryData(["categories"], context?.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onSuccess: () => { toast.success("Category created"); },
  });
  
  const update = useMutation({
    mutationFn: () => api.updateCategory(initial!.id, { name: name.trim(), color, icon }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["categories"] });
      const previous = qc.getQueryData(["categories"]);
      qc.setQueryData(["categories"], (old: any) => old?.map((c: any) => c.id === initial!.id ? { ...c, name: name.trim(), color, icon } : c));
      onClose();
      return { previous };
    },
    onError: (e: any, variables, context) => { toast.error(e?.message || "Could not update"); qc.setQueryData(["categories"], context?.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onSuccess: () => { toast.success("Category updated"); },
  });

  const isEdit = !!initial;
  const submit = () => (isEdit ? update.mutate() : create.mutate());
  const pending = create.isPending || update.isPending;

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div className="absolute inset-0 bg-background/60 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative w-full max-w-lg p-6 space-y-5">
        <button onClick={onClose} className="absolute top-3 right-3 size-9 grid place-items-center rounded-lg hover:bg-white/10">
          <X className="size-4" />
        </button>
        <div>
          <div className="text-xs text-muted-foreground">{isEdit ? "Edit" : "Create"}</div>
          <div className="font-display text-2xl">{isEdit ? "Edit category" : "New category"}</div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Name</div>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deep Work"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20" />
          </label>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Color</div>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((p) => (
                <button key={p} onClick={() => setColor(p)}
                  className="size-9 rounded-xl border border-white/10 grid place-items-center transition hover:scale-110"
                  style={{ background: p }}>
                  {color === p && <Check className="size-4" style={{ color: "hsl(30 25% 8%)" }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Icon</div>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button key={i} onClick={() => setIcon(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${icon === i ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 border border-white/10 bg-white/[0.03] flex items-center gap-3">
            <div className="size-10 rounded-xl grid place-items-center shadow-glow" style={{ background: color }}>
              <Tag className="size-5" style={{ color: "hsl(30 25% 8%)" }} />
            </div>
            <div>
              <div className="text-sm">{name || "Preview"}</div>
              <div className="text-xs text-muted-foreground">{icon}</div>
            </div>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}
          disabled={!name.trim() || pending} onClick={submit}
          className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
          {pending && <Loader2 className="size-4 animate-spin" />} {isEdit ? "Save changes" : "Create category"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
