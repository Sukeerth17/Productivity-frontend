import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/auth";
import { Shimmer } from "@/components/glass/Skeleton";

export function ProtectedRoute() {
  const { token, ready } = useAuth();
  const [showWakeupHint, setShowWakeupHint] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!ready && token) {
      timer = setTimeout(() => setShowWakeupHint(true), 2500);
    }
    return () => clearTimeout(timer);
  }, [ready, token]);

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="space-y-4">
            <Shimmer className="h-10 w-1/3 mx-auto" />
            <Shimmer className="h-40" />
          </div>
          <AnimatePresence>
            {showWakeupHint && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground animate-pulse"
              >
                Waking up the system... Please wait a few seconds.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
