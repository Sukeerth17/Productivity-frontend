import { Shimmer, SkeletonGroup, SkeletonItem, SkeletonCard, SkeletonText, SkeletonIconBox, SkeletonCircle, SkeletonBadge } from "@/components/glass/Skeleton";

export default function CategoryDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <SkeletonText width="w-32" height="h-4" variant="pulse" />
        <Shimmer variant="glow" delay={0.05} className="size-9 rounded-lg" />
      </div>

      {/* Hero Card */}
      <SkeletonCard delay={0.1} className="relative overflow-hidden p-8">
        {/* Fake color blur blob */}
        <div 
          className="absolute -top-24 -right-24 size-64 rounded-full opacity-10 blur-3xl bg-primary"
          style={{ animation: `skeleton-breathe 4s ease-in-out infinite`, animationDelay: `0.15s` }}
        />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <SkeletonIconBox size="size-16" radius="rounded-3xl" variant="glow" delay={0.2} />
            <div className="space-y-2">
              <SkeletonText width="w-48" height="h-10" variant="shimmer" delay={0.25} />
              <SkeletonText width="w-32" height="h-4" variant="pulse" delay={0.3} />
            </div>
          </div>
          <Shimmer variant="glow" delay={0.35} className="w-32 h-12 rounded-xl" />
        </div>
      </SkeletonCard>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        <Shimmer variant="shimmer" delay={0.4} className="w-16 h-8 rounded-lg" />
        <Shimmer variant="shimmer" delay={0.45} className="w-20 h-8 rounded-lg" />
        <Shimmer variant="shimmer" delay={0.5} className="w-24 h-8 rounded-lg" />
      </div>

      {/* Task List */}
      <SkeletonGroup className="grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonItem key={i}>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <SkeletonCircle size="size-5" variant="glow" delay={0.55 + i * 0.1} className="rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <SkeletonText width={["w-64", "w-48", "w-72", "w-56", "w-80"][i]} height="h-3.5" variant="shimmer" delay={0.55 + i * 0.1} />
                {i % 2 === 0 && <SkeletonText width="w-24" height="h-2.5" variant="pulse" delay={0.6 + i * 0.1} />}
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBadge width="w-12" variant="pulse" delay={0.6 + i * 0.1} />
                {i % 3 !== 2 && <SkeletonBadge variant="glow" delay={0.6 + i * 0.1} />}
              </div>
            </div>
          </SkeletonItem>
        ))}
      </SkeletonGroup>
    </div>
  );
}
