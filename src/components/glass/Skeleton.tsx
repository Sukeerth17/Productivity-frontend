import { cn } from "@/lib/utils";

export function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-xl bg-muted/40",
        "bg-no-repeat bg-[length:200%_100%] animate-[shimmer_1.2s_linear_infinite]",
        "bg-[linear-gradient(110deg,transparent_25%,hsl(var(--glass-border)/0.25)_50%,transparent_75%)]",
        className
      )}
    />
  );
}
