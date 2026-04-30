import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

const Auth = lazy(() => import("@/pages/Auth"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Insights = lazy(() => import("@/pages/Insights"));
const Settings = lazy(() => import("@/pages/Settings"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/store/theme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

const Boot = ({ children }: { children: React.ReactNode }) => {
  const hydrate = useAuth((s) => s.hydrate);
  const hydrateTheme = useTheme((s) => s.hydrate);
  useEffect(() => { hydrateTheme(); hydrate(); }, [hydrate, hydrateTheme]);
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner theme="dark" position="top-right" richColors />
      <BrowserRouter>
        <Boot>
          <Suspense fallback={
            <div className="min-h-screen grid place-items-center bg-background">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/:id" element={<CategoryDetail />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Boot>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
