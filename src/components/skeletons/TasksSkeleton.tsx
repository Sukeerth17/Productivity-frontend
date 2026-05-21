import { Shimmer, SkeletonGroup, SkeletonItem, SkeletonCard, SkeletonText, SkeletonCircle, SkeletonBadge } from "@/components/glass/Skeleton";

export default function TasksSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SkeletonText width="w-20" height="h-3" variant="pulse" />
          <SkeletonText width="w-32" height="h-8" variant="shimmer" delay={0.05} />
        </div>
        <Shimmer variant="glow" delay={0.1} className="w-28 h-10 rounded-xl" />
      </div>

      {/* Filter Bar */}
      <SkeletonCard delay={0.15} className="p-4 overflow-visible bg-white/[0.02]">
        <div className="flex flex-wrap gap-4 items-center">
          <Shimmer variant="shimmer" delay={0.2} className="flex-1 sm:max-w-xs h-9 rounded-xl" />
          
          <div className="flex flex-wrap gap-2 items-center">
            <Shimmer variant="pulse" delay={0.25} className="size-3.5 rounded" />
            
            <Shimmer variant="pulse" delay={0.25} className="w-32 h-9 rounded-xl" />
            <Shimmer variant="pulse" delay={0.3} className="w-24 h-9 rounded-xl" />
            
            <Shimmer variant="shimmer" delay={0.35} className="w-[160px] h-9 rounded-xl" />
            <Shimmer variant="shimmer" delay={0.4} className="w-[130px] h-9 rounded-xl" />
            <Shimmer variant="shimmer" delay={0.45} className="w-[130px] h-9 rounded-xl" />
          </div>
        </div>
      </SkeletonCard>

      {/* Task Grid */}
      <SkeletonGroup className="grid lg:grid-cols-2 gap-6">
        {/* Active Section */}
        <SkeletonItem>
          <SkeletonCard delay={0.3}>
            <div className="flex items-baseline justify-between mb-4">
              <SkeletonText width="w-20" height="h-6" variant="glow" delay={0.35} />
              <SkeletonText width="w-16" height="h-3" variant="pulse" delay={0.35} />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <SkeletonCircle size="size-5" variant="glow" delay={0.4 + i * 0.1} className="rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonText width={["w-48", "w-32", "w-56", "w-40"][i]} height="h-3.5" variant="shimmer" delay={0.4 + i * 0.1} />
                    {i % 2 === 0 && <SkeletonText width="w-24" height="h-2.5" variant="pulse" delay={0.45 + i * 0.1} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <SkeletonBadge width="w-10" variant="pulse" delay={0.45 + i * 0.1} />
                    {i % 3 !== 1 && <SkeletonBadge variant="glow" delay={0.45 + i * 0.1} />}
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        </SkeletonItem>

        {/* Completed Section */}
        <SkeletonItem>
          <SkeletonCard delay={0.4}>
            <div className="flex items-baseline justify-between mb-4">
              <SkeletonText width="w-28" height="h-6" variant="glow" delay={0.45} />
              <SkeletonText width="w-16" height="h-3" variant="pulse" delay={0.45} />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <SkeletonCircle size="size-5" variant="glow" delay={0.5 + i * 0.1} className="rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonText width={["w-32", "w-40", "w-48"][i]} height="h-3.5" variant="shimmer" delay={0.5 + i * 0.1} />
                    <SkeletonText width="w-20" height="h-2.5" variant="pulse" delay={0.55 + i * 0.1} />
                  </div>
                  <SkeletonBadge width="w-10" variant="pulse" delay={0.55 + i * 0.1} />
                </div>
              ))}
            </div>
          </SkeletonCard>
        </SkeletonItem>
      </SkeletonGroup>
    </div>
  );
}
