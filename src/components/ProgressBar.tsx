import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
  height?: number;
}

export default function ProgressBar({ percent, height = 32 }: ProgressBarProps) {
  return (
    <div className="relative w-full border-game rounded-inner overflow-hidden" style={{ height }}>
      <div className="absolute inset-0 bg-card" />
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-heading font-bold text-foreground">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}