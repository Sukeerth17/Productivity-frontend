import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ProgressBarProps {
  percent: number;
  height?: number;
}

const milestones = [25, 50, 75, 100];

export default function ProgressBar({ percent, height = 32 }: ProgressBarProps) {
  return (
    <div className="relative w-full border-game rounded-inner overflow-visible" style={{ height }}>
      <div className="absolute inset-0 rounded-inner bg-card" />
      <motion.div
        className="absolute inset-y-0 left-0 rounded-inner bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {milestones.map((m) => (
        <div
          key={m}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${m}%` }}
        >
          <Star
            size={16}
            className={percent >= m ? "fill-foreground text-foreground" : "fill-muted/30 text-muted/50"}
          />
        </div>
      ))}
    </div>
  );
}
