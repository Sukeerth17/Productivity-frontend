import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createTask,
  deleteCategory,
  deleteTask,
  getCategories,
  getDashboardStats,
  getTasks,
  patchCategory,
  toggleSubTask,
  toggleTask,
  type ApiCategory,
  type ApiTask,
} from "@/lib/api";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  completed: boolean;
  isHabit: boolean;
  priority?: "low" | "medium" | "high";
  subTasks: SubTask[];
  dueTime?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DayHistory {
  date: string;
  completed: number;
  total: number;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  history: DayHistory[];
  streak: number;
  totalMomentum: number;
}

type UseAppStateOptions = {
  categories?: boolean;
  tasks?: boolean;
  dashboardStats?: boolean;
};

function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
  };
}

function mapTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    categoryId: task.category_id,
    completed: task.completed,
    isHabit: task.is_habit,
    priority: task.priority ?? undefined,
    subTasks: task.subtasks.map((sub) => ({
      id: sub.id,
      title: sub.title,
      completed: sub.completed,
    })),
    dueTime: task.due_time ?? undefined,
    createdAt: task.created_at,
    completedAt: task.completed_at ?? undefined,
  };
}

function deriveHistory(tasks: Task[]): DayHistory[] {
  const byDate = new Map<string, DayHistory>();
  for (const task of tasks) {
    const date = task.createdAt.slice(0, 10);
    const existing = byDate.get(date);
    if (existing) {
      existing.total += 1;
      if (task.completed) existing.completed += 1;
      continue;
    }
    byDate.set(date, {
      date,
      total: 1,
      completed: task.completed ? 1 : 0,
    });
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function deriveStreak(history: DayHistory[]): number {
  if (history.length === 0) return 0;
  const completedDays = new Set(history.filter((d) => d.completed > 0).map((d) => d.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!completedDays.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useAppState(options?: UseAppStateOptions) {
  const withDefaults: Required<UseAppStateOptions> = {
    categories: options?.categories ?? true,
    tasks: options?.tasks ?? true,
    dashboardStats: options?.dashboardStats ?? true,
  };
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: withDefaults.categories,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks({ limit: 200, offset: 0 }),
    enabled: withDefaults.tasks,
  });

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    enabled: withDefaults.dashboardStats,
  });

  const invalidateData = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }, [queryClient]);

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: invalidateData,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; color?: string; icon?: string } }) =>
      patchCategory(id, payload),
    onSuccess: invalidateData,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidateData,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: invalidateData,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: toggleTask,
    onSuccess: invalidateData,
  });

  const toggleSubTaskMutation = useMutation({
    mutationFn: ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) => toggleSubTask(taskId, subTaskId),
    onSuccess: invalidateData,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: invalidateData,
  });

  const categories = useMemo(() => (categoriesQuery.data ?? []).map(mapCategory), [categoriesQuery.data]);

  const tasks = useMemo(() => (tasksQuery.data?.items ?? []).map(mapTask), [tasksQuery.data?.items]);

  const history = useMemo(() => deriveHistory(tasks), [tasks]);
  const streak = useMemo(() => deriveStreak(history), [history]);

  const completedToday = tasks.filter((task) => task.completed).length;
  const totalToday = tasks.length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const totalMomentum = useMemo(() => {
    if (statsQuery.data) return statsQuery.data.completed_tasks * 5;
    return tasks.filter((task) => task.completed).length * 5;
  }, [statsQuery.data, tasks]);

  const addCategory = useCallback((cat: Omit<Category, "id">) => {
    createCategoryMutation.mutate({ name: cat.name, color: cat.color, icon: cat.icon });
  }, [createCategoryMutation]);

  const updateCategory = useCallback((catId: string, updates: Partial<Category>) => {
    const payload: { name?: string; color?: string; icon?: string } = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    updateCategoryMutation.mutate({ id: catId, payload });
  }, [updateCategoryMutation]);

  const removeCategory = useCallback((catId: string) => {
    deleteCategoryMutation.mutate(catId);
  }, [deleteCategoryMutation]);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    createTaskMutation.mutate({
      title: task.title,
      category_id: task.categoryId,
      completed: task.completed,
      is_habit: task.isHabit,
      priority: task.priority,
      due_time: task.dueTime ?? null,
      subtasks: task.subTasks.map((sub) => ({ title: sub.title, completed: sub.completed })),
    });
  }, [createTaskMutation]);

  const removeTask = useCallback((taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  }, [deleteTaskMutation]);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    toggleTaskMutation.mutate(taskId);
  }, [toggleTaskMutation]);

  const toggleSubTaskCompletion = useCallback((taskId: string, subId: string) => {
    toggleSubTaskMutation.mutate({ taskId, subTaskId: subId });
  }, [toggleSubTaskMutation]);

  return {
    tasks,
    categories,
    history,
    streak,
    totalMomentum,
    toggleTask: toggleTaskCompletion,
    toggleSubTask: toggleSubTaskCompletion,
    addTask,
    deleteTask: removeTask,
    addCategory,
    deleteCategory: removeCategory,
    updateCategory,
    completedToday,
    totalToday,
    progressPercent,
  };
}

export const CATEGORY_COLORS = [
  "#FFE66D", "#FF9F43", "#FF6B6B", "#FF6B9D", "#9D4EDD", "#4ECDC4",
  "#2D9B83", "#26DE81", "#45AAF2", "#D1F2EB", "#F9E547", "#A0A083",
];

export const CATEGORY_ICONS = [
  "graduation-cap", "heart", "briefcase", "book-open", "dumbbell", "music",
  "palette", "code", "home", "star", "zap", "coffee",
];

export function getCategoryColorHex(color: string): string {
  const map: Record<string, string> = {
    "cat-college": "#FFE66D",
    "cat-health": "#4ECDC4",
    "cat-work": "#9D4EDD",
  };
  return map[color] || color;
}
