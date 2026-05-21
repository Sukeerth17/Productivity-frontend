import { motion } from "framer-motion";
import {
  Shimmer,
  SkeletonGroup,
  SkeletonItem,
  SkeletonCard,
  SkeletonText,
  SkeletonIconBox,
  SkeletonCircle,
  SkeletonChart,
} from "@/components/glass/Skeleton";

/**
 * AppSkeleton — shown while the auth system is hydrating.
 * Mimics the full AppShell layout: sidebar + topbar + dashboard-like content.
 */
export default function AppSkeleton() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* ── Fake Sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex flex-col w-64 border-r border-white/[0.06] bg-white/[0.02] p-4 gap-6">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-2 py-3">
          <SkeletonIconBox size="size-8" variant="glow" radius="rounded-lg" />
          <SkeletonText width="w-24" height="h-5" variant="shimmer" />
        </div>

        {/* Nav items */}
        <SkeletonGroup className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonItem key={i}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <Shimmer variant="pulse" delay={i * 0.08} className="size-5 rounded-lg" />
                <SkeletonText
                  width={["w-16", "w-12", "w-20", "w-14", "w-16"][i]}
                  height="h-3.5"
                  variant="shimmer"
                  delay={i * 0.08}
                />
              </div>
            </SkeletonItem>
          ))}
        </SkeletonGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom user area */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <SkeletonCircle size="size-8" variant="glow" />
          <div className="flex-1 space-y-1.5">
            <SkeletonText width="w-20" height="h-3" variant="shimmer" />
            <SkeletonText width="w-28" height="h-2.5" variant="pulse" delay={0.1} />
          </div>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Fake Topbar */}
        <div className="sticky top-0 z-30 h-14 px-4 md:px-6 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <SkeletonText width="w-48" height="h-4" variant="shimmer" />
          <div className="flex items-center gap-3">
            <Shimmer variant="pulse" className="size-8 rounded-lg" />
            <SkeletonCircle size="size-8" variant="glow" />
          </div>
        </div>

        {/* Page content — dashboard-like skeleton */}
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <SkeletonText width="w-28" height="h-3.5" variant="pulse" />
              <SkeletonText width="w-56" height="h-8" variant="shimmer" delay={0.05} />
            </motion.div>

            {/* Stats row */}
            <SkeletonGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonItem key={i}>
                  <SkeletonCard delay={i * 0.06} className="p-5">
                    <div className="flex items-center justify-between">
                      <SkeletonText width="w-16" height="h-3" variant="shimmer" delay={i * 0.08} />
                      <SkeletonIconBox size="size-9" variant="glow" delay={i * 0.08} />
                    </div>
                    <SkeletonText width="w-12" height="h-7" variant="glow" delay={i * 0.08 + 0.15} className="mt-3" />
                  </SkeletonCard>
                </SkeletonItem>
              ))}
            </SkeletonGroup>

            {/* Chart area */}
            <div className="grid lg:grid-cols-3 gap-4">
              <SkeletonCard delay={0.3} className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1.5">
                    <SkeletonText width="w-20" height="h-3" variant="pulse" delay={0.35} />
                    <SkeletonText width="w-32" height="h-5" variant="shimmer" delay={0.4} />
                  </div>
                  <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Shimmer key={i} variant="pulse" delay={0.4 + i * 0.05} className="w-12 h-6 rounded-md" />
                    ))}
                  </div>
                </div>
                <SkeletonChart height="h-52" delay={0.45} />
              </SkeletonCard>

              <SkeletonCard delay={0.35}>
                <div className="space-y-1.5 mb-4">
                  <SkeletonText width="w-16" height="h-3" variant="pulse" delay={0.4} />
                  <SkeletonText width="w-28" height="h-5" variant="shimmer" delay={0.45} />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SkeletonCircle size="size-2.5" variant="glow" delay={0.5 + i * 0.08} />
                          <SkeletonText width={["w-20", "w-16", "w-24", "w-14"][i]} height="h-3" variant="shimmer" delay={0.5 + i * 0.08} />
                        </div>
                        <SkeletonText width="w-8" height="h-3" variant="pulse" delay={0.55 + i * 0.08} />
                      </div>
                      <Shimmer variant="wave" delay={0.55 + i * 0.1} className="h-2 rounded-full" />
                    </div>
                  ))}
                </div>
              </SkeletonCard>
            </div>

            {/* Recent tasks */}
            <SkeletonCard delay={0.5}>
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <SkeletonText width="w-12" height="h-3" variant="pulse" delay={0.55} />
                  <SkeletonText width="w-24" height="h-5" variant="shimmer" delay={0.6} />
                </div>
                <Shimmer variant="glow" delay={0.55} className="size-4 rounded" />
              </div>
              <div className="space-y-0 divide-y divide-white/[0.04]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <SkeletonCircle size="size-2.5" variant="glow" delay={0.65 + i * 0.08} />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonText width={["w-48", "w-36", "w-56", "w-40"][i]} height="h-3.5" variant="shimmer" delay={0.65 + i * 0.08} />
                      {i % 2 === 0 && <SkeletonText width="w-16" height="h-2.5" variant="pulse" delay={0.7 + i * 0.08} />}
                    </div>
                    {i % 3 !== 2 && (
                      <Shimmer variant="pulse" delay={0.7 + i * 0.08} className="h-5 w-12 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </SkeletonCard>
          </div>
        </main>
      </div>
    </div>
  );
}
