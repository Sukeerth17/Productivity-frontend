import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Index from "./pages/Index";
import CategoryDetail from "./pages/CategoryDetail";
import HistoryVault from "./pages/HistoryVault";
import CategoryManager from "./pages/CategoryManager";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/settings" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
