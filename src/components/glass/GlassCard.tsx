import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Props extends HTMLMotionProps<"div"> {
  strong?: boolean;
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className, strong, hover, children, ...rest }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(strong ? "glass-strong" : "glass", hover && "glass-hover", "p-6", className)}
      {...rest}
    >
      {children}
    </motion.div>
  )
);
GlassCard.displayName = "GlassCard";
