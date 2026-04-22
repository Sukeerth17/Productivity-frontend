import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
  height?: number;
}

export default function ProgressBar({ percent, height = 16 }: ProgressBarProps) {
  return (
    <div className="relative w-full rounded-full bg-card border-game overflow-hidden" style={{ height }}>
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}