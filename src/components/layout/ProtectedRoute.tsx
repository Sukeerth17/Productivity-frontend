import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Shimmer } from "@/components/glass/Skeleton";

export function ProtectedRoute() {
  const { token, ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="w-full max-w-2xl space-y-4">
          <Shimmer className="h-10 w-1/3" />
          <Shimmer className="h-40" />
          <Shimmer className="h-40" />
        </div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
