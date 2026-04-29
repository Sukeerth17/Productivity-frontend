import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";
import Categories from "@/pages/Categories";
import NotFound from "@/pages/NotFound";

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
          <Routes>
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Boot>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
