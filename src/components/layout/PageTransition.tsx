import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

const variants: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.985, filter: "blur(10px)" },
  enter:   { opacity: 1, y: 0,  scale: 1,     filter: "blur(0px)" },
  exit:    { opacity: 0, y: -8, scale: 0.99,  filter: "blur(8px)" },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
          opacity: { duration: 0.4 },
          filter: { duration: 0.5 },
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
