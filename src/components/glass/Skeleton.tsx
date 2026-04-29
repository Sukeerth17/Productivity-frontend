import { cn } from "@/lib/utils";
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl animate-shimmer bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,hsl(var(--glass-border)/0.05),hsl(var(--glass-border)/0.18),hsl(var(--glass-border)/0.05))]",
        className
      )}
    />
  );
}
