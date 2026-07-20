import type { ProductListItem } from '@/api/modules/product';
import { Link } from '@/router';

type GoodsCardProps = {
  product: ProductListItem;
};

export default function GoodsCard({ product }: GoodsCardProps) {
  const discount = product.discountPercentage ?? 0;
  const originalPrice = discount > 0 ? product.price / (1 - discount / 100) : undefined;
  const isLowStock = product.availabilityStatus.toLowerCase().includes('low');
  const isOutOfStock = product.availabilityStatus.toLowerCase().includes('out');
  const stockTone = isOutOfStock ? 'bg-red-400' : isLowStock ? 'bg-amber-400' : 'bg-[#31ED87]';

  return (
    <Link
      href={`/goods/${product.id}?ch=123`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#191919] transition duration-200 outline-none hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#1D1D1D] hover:shadow-[0_14px_28px_rgba(0,0,0,0.24)] focus-visible:border-[#31ED87]/70 focus-visible:ring-2 focus-visible:ring-[#31ED87]/25 active:translate-y-0"
    >
      <div className="relative aspect-square overflow-hidden bg-[#222222] p-3 sm:p-4">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="size-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-white/30">
            暂无图片
          </div>
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 rounded-[5px] bg-[#31ED87] px-1.5 py-1 text-[11px] leading-none font-black text-[#112019]">
            -{Math.round(discount)}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2 text-[11px] leading-4">
          <span className="truncate font-semibold text-white/42">
            {product.brand ?? formatCategory(product.category)}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-white/45">
            <span className={`size-1.5 rounded-full ${stockTone}`} />
            {formatAvailability(product.availabilityStatus)}
          </span>
        </div>

        <h2 className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 font-bold text-white">
          {product.title}
        </h2>

        <div className="mt-2 flex items-center gap-2 text-xs text-white/42">
          <span>{formatCategory(product.category)}</span>
          {product.rating !== undefined && (
            <>
              <span aria-hidden className="size-0.5 rounded-full bg-white/25" />
              <span>评分 {product.rating.toFixed(1)}</span>
            </>
          )}
        </div>

        <div className="mt-auto flex min-h-10 items-end gap-2 pt-3">
          <span className="text-lg leading-none font-black text-[#31ED87]">
            {formatPrice(product.price)}
          </span>
          {originalPrice !== undefined && (
            <span className="truncate text-xs leading-none text-white/28 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function formatCategory(category: string) {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatAvailability(status: string) {
  if (status.toLowerCase().includes('out')) return '缺货';
  if (status.toLowerCase().includes('low')) return '库存较少';
  return '有货';
}
