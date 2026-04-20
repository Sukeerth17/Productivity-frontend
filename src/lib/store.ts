import { useCallback, useEffect, useMemo, useRef } from "react";
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

type UseAppStateOptions = {
  categories?: boolean;
  tasks?: boolean;
  dashboardStats?: boolean;
};

export function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
  };
}

export function mapTask(task: ApiTask): Task {
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

export function useAppState(options?: UseAppStateOptions) {
  const withDefaults: Required<UseAppStateOptions> = {
    categories: options?.categories ?? true,
    tasks: options?.tasks ?? true,
    dashboardStats: options?.dashboardStats ?? true,
  };
  const queryClient = useQueryClient();

  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  const scheduleReset = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // next midnight in local time
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    midnightTimerRef.current = setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      scheduleReset(); // reschedule for the next midnight
    }, msUntilMidnight);
  };

  scheduleReset();

  return () => {
    if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
  };
}, [queryClient]);
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: withDefaults.categories,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", { scope: "all" }],
    queryFn: () => getTasks({ limit: 200, offset: 0 }),
    enabled: withDefaults.tasks,
  });

  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    enabled: withDefaults.dashboardStats,
  });

  const invalidateCategories = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  }, [queryClient]);

  const invalidateTasks = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [queryClient]);

  const invalidateDashboardStats = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }, [queryClient]);

  const invalidateHistory = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["history-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["category-completion"] });
  }, [queryClient]);

  const invalidateTaskDrivenData = useCallback(() => {
    invalidateTasks();
    invalidateDashboardStats();
    invalidateHistory();
  }, [invalidateDashboardStats, invalidateHistory, invalidateTasks]);

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidateCategories();
      invalidateDashboardStats();
      invalidateHistory();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; color?: string; icon?: string } }) =>
      patchCategory(id, payload),
    onSuccess: () => {
      invalidateCategories();
      invalidateHistory();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidateCategories();
      invalidateTaskDrivenData();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: invalidateTaskDrivenData,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: toggleTask,
    onSuccess: invalidateTaskDrivenData,
  });

  const toggleSubTaskMutation = useMutation({
    mutationFn: ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) => toggleSubTask(taskId, subTaskId),
    onSuccess: invalidateTaskDrivenData,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: invalidateTaskDrivenData,
  });

  const categories = useMemo(() => (categoriesQuery.data ?? []).map(mapCategory), [categoriesQuery.data]);
  const tasks = useMemo(() => (tasksQuery.data?.items ?? []).map(mapTask), [tasksQuery.data?.items]);

  const todayStr = new Date().toLocaleDateString("en-CA"); // gives YYYY-MM-DD in local time

const todayTasks = tasks.filter((task) => {
  const taskDate = new Date(task.createdAt).toLocaleDateString("en-CA");
  return taskDate === todayStr;
});

const completedToday = todayTasks.filter((task) => task.completed).length;
const totalToday = todayTasks.length;
const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

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

  const totalMomentum = useMemo(() => {
    if (statsQuery.data) return statsQuery.data.completed_tasks * 5;
    return tasks.filter((task) => task.completed).length * 5;
  }, [statsQuery.data, tasks]);

  return {
    tasks,
    categories,
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
