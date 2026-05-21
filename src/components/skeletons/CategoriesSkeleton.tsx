import { Shimmer, SkeletonGroup, SkeletonItem, SkeletonCard, SkeletonText, SkeletonBar, SkeletonIconBox } from "@/components/glass/Skeleton";

export default function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <SkeletonText width="w-20" height="h-3" variant="pulse" />
          <SkeletonText width="w-40" height="h-8" variant="shimmer" delay={0.05} />
          <SkeletonText width="w-56" height="h-3" variant="shimmer" delay={0.1} className="mt-1" />
        </div>
        <Shimmer variant="glow" delay={0.15} className="w-36 h-10 rounded-xl" />
      </div>

      {/* Categories Grid */}
      <SkeletonGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonItem key={i}>
            <SkeletonCard delay={0.2 + i * 0.08} className="relative overflow-hidden p-6">
              {/* Fake color blur blob */}
              <div 
                className="absolute -top-16 -right-16 size-40 rounded-full opacity-10 blur-2xl bg-primary"
                style={{ animation: `skeleton-breathe 4s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
              />
              
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-3">
                  <SkeletonIconBox size="size-12" radius="rounded-2xl" variant="glow" delay={0.25 + i * 0.08} />
                  <div className="space-y-1.5">
                    <SkeletonText width={["w-24", "w-32", "w-28", "w-36", "w-20", "w-24"][i]} height="h-5" variant="shimmer" delay={0.3 + i * 0.08} />
                    <SkeletonText width="w-16" height="h-3" variant="pulse" delay={0.35 + i * 0.08} />
                  </div>
                </div>
                <div className="flex gap-1 relative z-10">
                  <Shimmer variant="pulse" delay={0.35 + i * 0.08} className="size-9 rounded-lg" />
                  <Shimmer variant="pulse" delay={0.4 + i * 0.08} className="size-9 rounded-lg" />
                </div>
              </div>

              <div className="mt-5 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <SkeletonText width="w-16" height="h-3" variant="shimmer" delay={0.45 + i * 0.08} />
                  <SkeletonText width="w-8" height="h-3" variant="pulse" delay={0.45 + i * 0.08} />
                </div>
                <SkeletonBar variant="wave" delay={0.5 + i * 0.08} className="h-2" />
                <SkeletonText width="w-24" height="h-3" variant="shimmer" delay={0.55 + i * 0.08} className="mt-2" />
              </div>
            </SkeletonCard>
          </SkeletonItem>
        ))}
      </SkeletonGroup>
    </div>
  );
}
