import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

interface SmoothLoadProps {
  isLoading: boolean;
  loadingComponent: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SmoothLoad({ isLoading, loadingComponent, children, className }: SmoothLoadProps) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {loadingComponent}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1],
              filter: { duration: 0.4 }
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
