import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ProgressBarProps {
  percent: number;
  height?: number;
}

const milestones = [25, 50, 75, 100];

export default function ProgressBar({ percent, height = 44 }: ProgressBarProps) {
  return (
    <div className="relative w-full px-3" style={{ height }}>
      <div className="absolute inset-0 border-game rounded-inner bg-card overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {milestones.map((m, index) => {
        const clampedLeft = `clamp(12px, ${m}%, calc(100% - 12px))`;
        return (
          <motion.div
            key={m}
            className="absolute flex items-center justify-center"
            style={{
              left: clampedLeft,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
          >
            <Star
              size={16}
              className={percent >= m ? "fill-foreground text-foreground" : "fill-muted/30 text-muted/50"}
            />
          </motion.div>
        );
      })}
    </div>
  );
}