import { Shimmer, SkeletonGroup, SkeletonItem, SkeletonCard, SkeletonText, SkeletonIconBox, SkeletonChart, SkeletonBar, SkeletonBadge, SkeletonCircle } from "@/components/glass/Skeleton";
import { motion } from "framer-motion";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-2"
      >
        <SkeletonText width="w-28" height="h-3.5" variant="pulse" />
        <div className="flex items-center gap-2">
          <SkeletonText width="w-32" height="h-8" variant="shimmer" delay={0.05} />
          <SkeletonText width="w-48" height="h-8" variant="shimmer" delay={0.1} />
        </div>
      </motion.div>

      {/* Stats row */}
      <SkeletonGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonItem key={i}>
            <SkeletonCard delay={i * 0.06} className="p-5">
              <div className="flex items-center justify-between">
                <SkeletonText width="w-24" height="h-3" variant="shimmer" delay={i * 0.08} />
                <SkeletonIconBox size="size-9" variant="glow" delay={i * 0.08} />
              </div>
              <SkeletonText width="w-16" height="h-8" variant="glow" delay={i * 0.08 + 0.15} className="mt-3" />
            </SkeletonCard>
          </SkeletonItem>
        ))}
      </SkeletonGroup>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <SkeletonCard delay={0.3} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <SkeletonText width="w-24" height="h-3" variant="pulse" delay={0.35} />
              <SkeletonText width="w-40" height="h-6" variant="shimmer" delay={0.4} />
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              {Array.from({ length: 3 }).map((_, i) => (
                <Shimmer key={i} variant="pulse" delay={0.4 + i * 0.05} className="w-12 h-6 rounded-md" />
              ))}
            </div>
          </div>
          <SkeletonChart height="h-64" delay={0.45} />
        </SkeletonCard>

        <SkeletonCard delay={0.35}>
          <div className="space-y-2 mb-4">
            <SkeletonText width="w-20" height="h-3" variant="pulse" delay={0.4} />
            <SkeletonText width="w-36" height="h-6" variant="shimmer" delay={0.45} />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SkeletonCircle size="size-2.5" variant="glow" delay={0.5 + i * 0.08} />
                    <SkeletonText width={["w-24", "w-20", "w-32", "w-16"][i]} height="h-3" variant="shimmer" delay={0.5 + i * 0.08} />
                  </div>
                  <SkeletonText width="w-8" height="h-3" variant="pulse" delay={0.55 + i * 0.08} />
                </div>
                <SkeletonBar variant="wave" delay={0.55 + i * 0.1} />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      {/* Recent tasks */}
      <SkeletonCard delay={0.5}>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <SkeletonText width="w-16" height="h-3" variant="pulse" delay={0.55} />
            <SkeletonText width="w-32" height="h-6" variant="shimmer" delay={0.6} />
          </div>
          <Shimmer variant="glow" delay={0.55} className="size-4 rounded" />
        </div>
        <div className="space-y-0 divide-y divide-white/[0.04]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <SkeletonCircle size="size-2.5" variant="glow" delay={0.65 + i * 0.08} />
              <div className="flex-1 space-y-1.5">
                <SkeletonText width={["w-64", "w-48", "w-72", "w-56"][i]} height="h-3.5" variant="shimmer" delay={0.65 + i * 0.08} />
                {i % 2 === 0 && <SkeletonText width="w-24" height="h-2.5" variant="pulse" delay={0.7 + i * 0.08} />}
              </div>
              {i % 3 !== 2 && (
                <SkeletonBadge variant="pulse" delay={0.7 + i * 0.08} />
              )}
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
