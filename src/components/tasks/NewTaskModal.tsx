import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { api, type Priority } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || "");
  const [priority, setPriority] = useState<Priority | "none">("none");
  const [dueTime, setDueTime] = useState("");
  const [notes, setNotes] = useState("");
  const [newCat, setNewCat] = useState("");
  const [isHabit, setIsHabit] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [habitSchedule, setHabitSchedule] = useState<"daily" | "specific">("daily");
  const [habitDays, setHabitDays] = useState<number[]>([]);
  const [askGeneral, setAskGeneral] = useState(false);

  // Auto-scroll to form and focus input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      if (modalRef.current) {
        // Scroll to the input field
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const toggleDay = (d: number) => setHabitDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const resolvedHabitDays = isHabit && habitSchedule === "specific" && habitDays.length > 0 ? habitDays : null;

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
      priority: priority === "none" ? null : priority as Priority,
      due_time: dueTime || null,
      is_habit: isHabit,
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
      habit_days: resolvedHabitDays,
    }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = qc.getQueriesData({ queryKey: ["tasks"] });
      const tempId = `temp-${Date.now()}`;
      
      qc.setQueriesData({ queryKey: ["tasks"] }, (old: any) => {
        if (!old || !old.items) return old;
        return {
          ...old,
          items: [{ 
            id: tempId, 
            title: title.trim(), 
            category_id: categoryId, 
            notes, 
            priority: priority === "none" ? null : priority, 
            due_time: dueTime, 
            is_habit: isHabit, 
            completed: false, 
            created_at: new Date().toISOString() 
          }, ...old.items],
          total: (old.total || 0) + 1
        };
      });
      onClose();
      return { previousTasks };
    },
    onError: (e: any, variables, context) => { 
      toast.error(e?.message || "Could not create task"); 
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] }); 
      qc.invalidateQueries({ queryKey: ["dashboard"] }); 
      qc.invalidateQueries({ queryKey: ["productivity"] });
    },
    onSuccess: () => { toast.success("Task added"); },
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
        priority: priority === "none" ? null : priority as Priority,
        due_time: dueTime || null,
        is_habit: isHabit,
        start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
        habit_days: resolvedHabitDays,
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
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={onClose} />
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-strong relative w-full max-w-xl p-6 sm:p-8 space-y-6 overflow-hidden rounded-[2rem] border-white/10 my-auto"
      >
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 size-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 size-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors"><X className="size-5" /></button>
        
        {askGeneral ? (
          <div className="space-y-4">
            <div className="font-display text-2xl">Create 'General' Category?</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This task requires a category. Would you like to automatically create a "General" category to store it?
            </p>
            <div className="flex gap-3 justify-end mt-8">
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl hover:bg-white/5 border border-white/10 transition-all">
                Cancel
              </button>
              <button onClick={handleAskGeneralYes} className="px-6 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-all active:scale-95">
                Yes, create
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-semibold ml-1">Composition</div>
              <div className="font-display text-3xl tracking-tight">New Momentum</div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Input 
                  ref={inputRef}
                  autoFocus 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (title.trim() && !(categories.length > 0 && !categoryId) && !create.isPending) {
                        handleCreate();
                      }
                    }
                  }}
                  placeholder="What's next?"
                  className="h-14 px-5 text-lg rounded-2xl bg-white/5 border-white/10 focus:bg-white/[0.08] transition-all duration-300 placeholder:text-white/20" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 ml-1 font-medium">Category</div>
                  {categories.length === 0 ? (
                    <div className="flex gap-2">
                      <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newCat.trim() && !createCat.isPending) {
                              createCat.mutate();
                            }
                          }
                        }}
                        className="rounded-xl bg-white/5 border-white/10" />
                      <button disabled={!newCat.trim() || createCat.isPending} onClick={() => createCat.mutate()}
                        className="px-4 rounded-xl bg-primary text-primary-foreground disabled:opacity-60 transition-all active:scale-95">
                        {createCat.isPending ? <Loader2 className="size-4 animate-spin" /> : "Add"}
                      </button>
                    </div>
                  ) : (
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/10">
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 ml-1 font-medium">Priority</div>
                  <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                    <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-0 focus:ring-offset-0 capitalize">
                      <SelectValue placeholder="No priority" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10">
                      <SelectItem value="none">No priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 ml-1 font-medium">Due Time</div>
                  <Input 
                    value={dueTime} 
                    onChange={(e) => setDueTime(e.target.value)} 
                    placeholder="HH:MM (optional)"
                    className="h-12 rounded-xl bg-white/5 border-white/10 focus:bg-white/[0.08]" 
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 ml-1 font-medium">Start Date</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all hover:bg-white/[0.08]",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-strong border-white/10" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="bg-transparent"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-white/30 ml-1 font-medium">Description</div>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Additional context..." 
                  rows={2}
                  className="rounded-xl bg-white/5 border-white/10 focus:bg-white/[0.08] resize-none min-h-[80px]" 
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-1 bg-white/5 rounded-2xl border border-white/10">
                  <button type="button" onClick={() => setIsHabit(false)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-300",
                      !isHabit ? "bg-white/[0.08] text-white shadow-sm" : "text-white/40 hover:text-white/60"
                    )}>One-off Task</button>
                  <button type="button" onClick={() => setIsHabit(true)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-300",
                      isHabit ? "bg-white/[0.08] text-white shadow-sm" : "text-white/40 hover:text-white/60"
                    )}>Daily Habit</button>
                </div>

                <AnimatePresence mode="wait">
                  {isHabit && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                        <button type="button" onClick={() => setHabitSchedule("daily")}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all",
                            habitSchedule === "daily" ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white/40"
                          )}>Every day</button>
                        <button type="button" onClick={() => setHabitSchedule("specific")}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all",
                            habitSchedule === "specific" ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white/40"
                          )}>Specific days</button>
                      </div>
                      
                      {habitSchedule === "specific" && (
                        <div className="flex justify-between">
                          {DAY_LABELS.map((label, i) => (
                            <button 
                              key={i} 
                              type="button" 
                              onClick={() => toggleDay(i)}
                              className={cn(
                                "size-10 rounded-full text-[10px] font-bold border transition-all duration-300",
                                habitDays.includes(i) 
                                  ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]" 
                                  : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                              )}
                            >
                              {label[0]}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              disabled={!title.trim() || (categories.length > 0 && !categoryId) || create.isPending}
              onClick={handleCreate}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-glow disabled:opacity-40 flex items-center justify-center gap-2 transition-shadow hover:shadow-[0_8px_30px_rgb(var(--primary-rgb),0.4)]">
              {create.isPending ? <Loader2 className="size-5 animate-spin" /> : "Initiate task"}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
