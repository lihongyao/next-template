import { useRef, useState } from 'react';

import { games } from '@/constants/data';
import { cn } from '@/libs/class-helpers';

import Button from '../Button';
import LazyImg from '../LazyImage';

interface CustomSwiperProps {
  /**  一屏显示几列，默认 3 */
  columns?: number;
  /** 列间距，默认 12px */
  gap?: number;
}

export default function CustomSwiper({ columns = 3, gap = 6 }: CustomSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(games.length / columns);

  // 点击下一页
  const handleNext = () => {
    if (!containerRef.current) return;
    const style = window.getComputedStyle(containerRef.current);
    const paddingLeft = parseFloat(style.paddingLeft);
    const clientWidth = containerRef.current.clientWidth;
    const scrollWidth = clientWidth - paddingLeft * 2 + gap;
    containerRef.current.scrollBy({ left: scrollWidth, behavior: 'smooth' });
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  // 点击上一页
  const handlePrev = () => {
    if (!containerRef.current) return;
    const style = window.getComputedStyle(containerRef.current);
    const paddingLeft = parseFloat(style.paddingLeft);
    const clientWidth = containerRef.current.clientWidth;
    const scrollWidth = clientWidth - paddingLeft * 2 + gap;
    containerRef.current.scrollBy({ left: -scrollWidth, behavior: 'smooth' });
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div data-name="custom-swiper">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-white">游戏列表</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrev} disabled={currentPage === 0}>
            上一页
          </Button>
          <Button onClick={handleNext} disabled={currentPage === totalPages - 1}>
            下一页
          </Button>
        </div>
      </header>

      <div
        ref={containerRef}
        className={cn(
          'custom-swiper no-scrollbar -mx-3 grid snap-x snap-mandatory grid-flow-col overflow-x-scroll overflow-y-hidden scroll-smooth px-3',
        )}
        style={{
          gap: gap,
          gridAutoColumns: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
        }}
      >
        {games.map((item, index) => (
          <div
            key={index}
            className="custom-swiper-item aspect-[200/267] overflow-hidden rounded-md"
          >
            <LazyImg className="h-full w-full object-cover" src={item.src} blurSrc={item.blurSrc} />
          </div>
        ))}
      </div>
    </div>
  );
}
