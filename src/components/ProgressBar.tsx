import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ProgressBarProps {
  percent: number;
  height?: number;
}

const milestones = [25, 50, 75, 100];

export default function ProgressBar({ percent, height = 44 }: ProgressBarProps) {
  const clampedPercent = Math.min(percent, 100);

  return (
    <div className="relative w-full px-4" style={{ height }}>
      
      {/* Background Track */}
      <div className="absolute inset-0 border-game rounded-inner bg-card overflow-hidden">
        
        {/* Animated Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Milestone Stars */}
      {milestones.map((m, index) => {
        const isReached = percent >= m;

        return (
          <motion.div
            key={m}
            className="absolute flex items-center justify-center"
            style={{
              left: `${m}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: isReached ? 1.2 : 1 }}
            transition={{
              delay: 0.1 * (index + 1),
              duration: 0.4,
              type: "spring",
              stiffness: 300,
            }}
          >
            <Star
              size={16}
              fill={isReached ? "currentColor" : "none"}
              className={isReached ? "text-foreground" : "text-muted/50"}
            />
          </motion.div>
        );
      })}
    </div>
  );
}