import { Shimmer, SkeletonGroup, SkeletonItem, SkeletonCard, SkeletonText, SkeletonBarChart } from "@/components/glass/Skeleton";

export default function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonText width="w-20" height="h-3.5" variant="pulse" />
        <SkeletonText width="w-32" height="h-8" variant="shimmer" delay={0.05} />
      </div>

      {/* Top Stats Row */}
      <SkeletonGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonItem key={i}>
            <SkeletonCard delay={0.1 + i * 0.08} className="p-5">
              <SkeletonText width="w-20" height="h-3.5" variant="shimmer" delay={0.15 + i * 0.08} />
              <SkeletonText width="w-16" height="h-8" variant="glow" delay={0.2 + i * 0.08} className="mt-2" />
              <SkeletonText width="w-12" height="h-3" variant="pulse" delay={0.25 + i * 0.08} className="mt-1" />
            </SkeletonCard>
          </SkeletonItem>
        ))}
      </SkeletonGroup>

      {/* Bar Chart Section */}
      <SkeletonCard delay={0.4}>
        <SkeletonText width="w-48" height="h-6" variant="shimmer" delay={0.45} className="mb-3" />
        <SkeletonBarChart height="h-72" delay={0.5} />
      </SkeletonCard>

      {/* Bottom Stats Row */}
      <SkeletonGroup className="grid lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonItem key={i}>
            <SkeletonCard delay={0.6 + i * 0.08} className="p-6">
              <SkeletonText width={["w-16", "w-32", "w-12"][i]} height="h-3.5" variant="shimmer" delay={0.65 + i * 0.08} />
              <div className="flex items-baseline gap-2 mt-1">
                <SkeletonText width={["w-12", "w-16", "w-24"][i]} height={["h-10", "h-10", "h-8"][i]} variant="glow" delay={0.7 + i * 0.08} />
                {i === 0 && <SkeletonText width="w-8" height="h-4" variant="pulse" delay={0.75} />}
              </div>
            </SkeletonCard>
          </SkeletonItem>
        ))}
      </SkeletonGroup>
    </div>
  );
}
