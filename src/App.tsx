import { Suspense, lazy, type ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";

const Index = lazy(() => import("./pages/Index"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const HistoryVault = lazy(() => import("./pages/HistoryVault"));
const CategoryManager = lazy(() => import("./pages/CategoryManager"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function PublicOnlyRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
      <p className="font-heading text-lg font-bold text-muted">Loading your workspace...</p>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route
                path="/login"
                element={(
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                )}
              />
              <Route
                path="/signup"
                element={(
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                )}
              />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/category/:slugOrId" element={<ProtectedRoute><CategoryDetail /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryVault /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
