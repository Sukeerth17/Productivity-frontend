import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/auth";
import AppSkeleton from "@/components/skeletons/AppSkeleton";

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
      <div className="relative min-h-screen">
        <AppSkeleton />
        <AnimatePresence>
          {showWakeupHint && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm"
            >
              <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 shadow-glow text-sm text-white animate-pulse">
                Waking up the system... Please wait a few seconds.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
