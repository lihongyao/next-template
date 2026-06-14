'use client';
import Button from '@/components/ui/Button';
import { getImageUrl } from '@/libs/cdn-image';

export default function PromotionPage() {
  const list = new Array(10).fill(0);
  return (
    <div data-name="promotion-page" className="p-3">
      <div className="flex flex-col gap-3">
        {list.map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-[#212121] text-black">
            <div
              className="aspect-[9/5] w-full bg-gray-500"
              style={{
                background: `url(${getImageUrl('configurable/promotion/jelly_express.avif')}) center center / cover no-repeat`,
              }}
            />
            <div className="flex w-full items-center gap-3 p-3">
              <div className="flex-1 text-sm leading-[21px]">
                <h2 className="font-bold text-white">Torneo Jelly Express</h2>
                <p className="text-[#b3b8c1]">Termina en 139H:30M:34S</p>
              </div>
              <Button onClick={() => {}}>Detalles</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
