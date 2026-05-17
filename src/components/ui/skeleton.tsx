import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/40",
        "bg-no-repeat bg-[length:200%_100%] animate-[shimmer_1.2s_linear_infinite]",
        "bg-[linear-gradient(110deg,transparent_25%,hsl(var(--glass-border)/0.25)_50%,transparent_75%)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
