import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_CARDS = 10;

export default function GoodsCatalogSkeleton() {
  return (
    <section
      aria-label="商品加载中"
      className="mx-auto max-w-[1200px] px-3 pt-4 pb-8 sm:px-5 md:px-6 md:pt-5"
    >
      <div className="rounded-[8px] border border-white/[0.06] bg-[#171717] p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-11 w-full rounded-[6px] md:w-[340px]" />
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <Skeleton className="h-4 w-[88px] rounded-[4px]" />
            <Skeleton className="h-11 w-[126px] rounded-[6px]" />
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-hidden">
          {[64, 92, 78, 112, 86, 104].map((width) => (
            <Skeleton key={width} className="h-9 shrink-0 rounded-[6px]" style={{ width }} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
        {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#191919]"
          >
            <Skeleton className="aspect-square w-full rounded-none bg-white/[0.06]" />
            <div className="space-y-2 p-3">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-3 w-[42%] rounded-[4px]" />
                <Skeleton className="h-3 w-[32%] rounded-[4px]" />
              </div>
              <Skeleton className="h-4 w-[88%] rounded-[4px]" />
              <Skeleton className="h-4 w-[62%] rounded-[4px]" />
              <Skeleton className="h-3 w-[54%] rounded-[4px]" />
              <div className="flex items-end gap-2 pt-2">
                <Skeleton className="h-[18px] w-[72px] rounded-[4px]" />
                <Skeleton className="h-3 w-[46px] rounded-[4px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
