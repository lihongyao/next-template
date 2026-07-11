import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/libs/class-helpers';

export default function GoodsCardSkeleton({ variant = 'page' }: { variant?: 'modal' | 'page' }) {
  const isPage = variant === 'page';

  return (
    <section className="bg-[#101010] px-3 py-4">
      <div
        className={cn(
          'mx-auto grid max-w-[1120px] gap-4',
          isPage && 'md:grid-cols-[minmax(0,1fr)_360px] md:px-6',
        )}
      >
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-[8px]" />

          <div className="space-y-3 rounded-[8px] bg-[#161616] p-4">
            <Skeleton className="h-[22px] w-[72%] rounded-full" />
            <Skeleton className="h-[14px] w-full rounded-full" />
            <Skeleton className="h-[14px] w-[86%] rounded-full" />
            <Skeleton className="h-[30px] w-[38%] rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-[24px] w-[64px] rounded-full" />
              <Skeleton className="h-[24px] w-[78px] rounded-full" />
            </div>
          </div>

          <div className="space-y-3 rounded-[8px] bg-[#161616] p-4">
            <Skeleton className="h-[18px] w-[96px] rounded-full" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="space-y-2 border-b border-white/8 pb-2" key={index}>
                  <Skeleton className="h-[10px] w-[42px] rounded-full" />
                  <Skeleton className="h-[14px] w-[72%] rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-[8px] bg-[#161616] p-4 md:self-start">
          <Skeleton className="h-[16px] w-[68%] rounded-full" />
          <Skeleton className="h-[12px] w-[46%] rounded-full" />
          <Skeleton className="h-[42px] w-full rounded-[8px]" />
          <Skeleton className="h-[44px] w-full rounded-[8px]" />
          <Skeleton className="h-[40px] w-full rounded-[8px]" />
        </div>
      </div>
    </section>
  );
}
