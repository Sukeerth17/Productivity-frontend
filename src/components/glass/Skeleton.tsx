import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────
 * ANIMATION VARIANTS
 * Multiple skeleton animation styles for a premium loading experience
 * ─────────────────────────────────────────────────────────────────────── */

type SkeletonVariant = "shimmer" | "pulse" | "wave" | "glow" | "breathe";

interface ShimmerProps {
  className?: string;
  style?: React.CSSProperties;
  /** Animation variant — defaults to "shimmer" */
  variant?: SkeletonVariant;
  /** Delay in seconds for staggered animations */
  delay?: number;
  /** Whether to use rounded-full instead of rounded-xl */
  rounded?: boolean;
}

/* ── Classic shimmer sweep — the bread & butter ── */
export function Shimmer({ className, style, variant = "shimmer", delay = 0, rounded }: ShimmerProps) {
  const baseClasses = cn(
    rounded ? "rounded-full" : "rounded-xl",
    "relative overflow-hidden",
  );

  const variantClasses: Record<SkeletonVariant, string> = {
    shimmer: cn(
      "bg-white/[0.04]",
      "bg-no-repeat bg-[length:200%_100%]",
      "bg-[linear-gradient(110deg,transparent_25%,hsl(var(--glass-border)/0.18)_37%,hsl(var(--glass-border)/0.25)_50%,hsl(var(--glass-border)/0.18)_63%,transparent_75%)]",
    ),
    pulse: "bg-white/[0.06]",
    wave: "bg-white/[0.04]",
    glow: cn(
      "bg-white/[0.03]",
      "border border-white/[0.06]",
    ),
    breathe: "bg-white/[0.04]",
  };

  const animationStyle: Record<SkeletonVariant, React.CSSProperties> = {
    shimmer: {
      animation: `shimmer 1.8s linear infinite`,
      animationDelay: `${delay}s`,
    },
    pulse: {
      animation: `skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
      animationDelay: `${delay}s`,
    },
    wave: {
      animation: `skeleton-wave 2.2s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    },
    glow: {
      animation: `skeleton-glow 2.5s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    },
    breathe: {
      animation: `skeleton-breathe 3s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    },
  };

  return (
    <div
      style={{ ...animationStyle[variant], ...style }}
      className={cn(baseClasses, variantClasses[variant], className)}
    />
  );
}

/* ── Staggered container — children fade in one by one ── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function SkeletonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SkeletonItem({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Semantic skeleton primitives ── */

/** Text line placeholder — varying widths for realism */
export function SkeletonText({
  width = "w-full",
  height = "h-3",
  variant = "shimmer",
  delay = 0,
  className,
}: {
  width?: string;
  height?: string;
  variant?: SkeletonVariant;
  delay?: number;
  className?: string;
}) {
  return <Shimmer variant={variant} delay={delay} className={cn(width, height, "rounded-md", className)} />;
}

/** Circular avatar/icon placeholder */
export function SkeletonCircle({
  size = "size-10",
  variant = "glow",
  delay = 0,
  className,
}: {
  size?: string;
  variant?: SkeletonVariant;
  delay?: number;
  className?: string;
}) {
  return <Shimmer variant={variant} delay={delay} rounded className={cn(size, className)} />;
}

/** Rounded icon box (like stat icon containers) */
export function SkeletonIconBox({
  size = "size-9",
  radius = "rounded-xl",
  variant = "glow",
  delay = 0,
  className,
}: {
  size?: string;
  radius?: string;
  variant?: SkeletonVariant;
  delay?: number;
  className?: string;
}) {
  return <Shimmer variant={variant} delay={delay} className={cn(size, radius, className)} />;
}

/** Fake progress bar */
export function SkeletonBar({
  variant = "wave",
  delay = 0,
  className,
}: {
  variant?: SkeletonVariant;
  delay?: number;
  className?: string;
}) {
  return <Shimmer variant={variant} delay={delay} className={cn("h-2 w-full rounded-full", className)} />;
}

/** Glass card shaped skeleton */
export function SkeletonCard({
  children,
  className,
  delay = 0,
}: {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(
        "rounded-2xl p-6",
        "bg-white/[0.03] border border-white/[0.06]",
        "backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/** Animated badge placeholder */
export function SkeletonBadge({
  width = "w-14",
  variant = "pulse",
  delay = 0,
  className,
}: {
  width?: string;
  variant?: SkeletonVariant;
  delay?: number;
  className?: string;
}) {
  return (
    <Shimmer
      variant={variant}
      delay={delay}
      className={cn(width, "h-5 rounded-full", className)}
    />
  );
}

/** Chart area placeholder with faux grid lines */
export function SkeletonChart({
  height = "h-64",
  delay = 0,
  className,
}: {
  height?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      className={cn("relative overflow-hidden rounded-xl", height, className)}
    >
      {/* Faux grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-full border-b border-white/[0.04]"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {/* Faux chart wave shape */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        style={{ height: "60%" }}
      >
        <defs>
          <linearGradient id="skel-chart-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,80 Q50,60 100,70 T200,50 T300,65 T400,40 L400,120 L0,120Z"
          fill="url(#skel-chart-grad)"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.3 }}
        />
        <motion.path
          d="M0,80 Q50,60 100,70 T200,50 T300,65 T400,40"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity={0.25}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeOut", delay: delay + 0.2 }}
        />
      </svg>
      {/* Faux X-axis labels */}
      <div className="absolute bottom-2 left-0 w-full flex justify-between px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} variant="pulse" delay={delay + i * 0.05} className="h-2 w-6 rounded-sm" />
        ))}
      </div>
    </motion.div>
  );
}

/** Bar chart skeleton with animated rising bars */
export function SkeletonBarChart({
  bars = 5,
  height = "h-64",
  delay = 0,
  className,
}: {
  bars?: number;
  height?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      className={cn("relative overflow-hidden rounded-xl", height, className)}
    >
      {/* Faux grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-full border-b border-white/[0.04]" />
        ))}
      </div>
      {/* Animated bars */}
      <div className="absolute bottom-8 left-0 w-full flex items-end justify-around px-8" style={{ height: "70%" }}>
        {Array.from({ length: bars }).map((_, i) => {
          const h = [65, 80, 45, 90, 55][i % 5];
          return (
            <div key={i} className="flex gap-1.5 items-end" style={{ height: "100%" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.12 }}
                className="w-5 rounded-t-lg bg-white/[0.06]"
                style={{ animation: `skeleton-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite`, animationDelay: `${i * 0.15}s` }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h * 0.6}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.12 + 0.05 }}
                className="w-5 rounded-t-lg bg-white/[0.1]"
                style={{ animation: `skeleton-glow 2.5s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
              />
            </div>
          );
        })}
      </div>
      {/* Faux X-axis labels */}
      <div className="absolute bottom-2 left-0 w-full flex justify-around px-8">
        {Array.from({ length: bars }).map((_, i) => (
          <Shimmer key={i} variant="pulse" delay={delay + i * 0.05} className="h-2 w-8 rounded-sm" />
        ))}
      </div>
    </motion.div>
  );
}
