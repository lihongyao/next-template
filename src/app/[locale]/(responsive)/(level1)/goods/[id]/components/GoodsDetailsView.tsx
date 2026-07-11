import Carousel from '@/components/ui/Carousel';
import { cn } from '@/libs/class-helpers';

import type { GoodsDetails, GoodsDimensions, GoodsReview } from '../types';
import GoodsActions from './GoodsActions';

export default function GoodsDetailsView({
  details,
  variant = 'page',
}: {
  details: GoodsDetails;
  variant?: 'modal' | 'page';
}) {
  const gallery = getGallery(details);
  const specs = getSpecs(details);
  const isPage = variant === 'page';

  return (
    <div className="bg-[#101010] pb-8 text-white">
      <section className="px-3 pt-3">
        {gallery.length > 0 ? (
          <Carousel<string>
            autoPlay={gallery.length > 1}
            desktopColumns={1}
            items={gallery}
            renderItem={(item) => (
              <div className="overflow-hidden rounded-[8px] bg-[#212121]">
                <img
                  className="aspect-square w-full object-contain"
                  src={item}
                  alt={details.title}
                />
              </div>
            )}
            showPagination={gallery.length > 1}
          />
        ) : (
          <div className="aspect-square rounded-[8px] bg-[#212121]" />
        )}
      </section>

      <main
        className={cn(
          'mx-auto grid max-w-[1120px] gap-4 px-3 py-4',
          isPage && 'md:grid-cols-[minmax(0,1fr)_360px] md:px-6',
        )}
      >
        <div className="space-y-4">
          <section className="rounded-[8px] bg-[#161616] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#31ED87]/12 px-2 py-1 text-xs font-semibold text-[#31ED87]">
                {details.category}
              </span>
              {details.brand && <span className="text-xs text-white/45">{details.brand}</span>}
            </div>

            <h2 className="mt-3 text-xl leading-tight font-bold text-white md:text-2xl">
              {details.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/62">{details.description}</p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-black text-[#31ED87]">
                {formatPrice(details.price)}
              </span>
              {details.discountPercentage !== undefined && (
                <span className="mb-1 rounded-full bg-white/8 px-2 py-1 text-xs font-semibold text-white/70">
                  {details.discountPercentage}% OFF
                </span>
              )}
              {details.rating !== undefined && (
                <span className="mb-1 text-xs text-white/45">评分 {details.rating}</span>
              )}
            </div>

            {details.tags && details.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {details.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/52"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {specs.length > 0 && (
            <section className="rounded-[8px] bg-[#161616] p-4">
              <h3 className="text-base font-bold text-white">商品信息</h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {specs.map((item) => (
                  <div key={item.label} className="border-b border-white/8 pb-2">
                    <dt className="text-xs text-white/38">{item.label}</dt>
                    <dd className="mt-1 text-sm text-white/76">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="rounded-[8px] bg-[#161616] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white">评论</h3>
              <span className="text-xs text-white/45">{details.reviews.length} 条</span>
            </div>
            <div className="mt-3 divide-y divide-white/8">
              {details.reviews.map((review, index) => (
                <ReviewItem key={`${review.reviewerEmail}-${index}`} review={review} />
              ))}
            </div>
          </section>
        </div>

        <aside className={cn(isPage && 'md:sticky md:top-[72px] md:self-start')}>
          <GoodsActions
            availabilityStatus={details.availabilityStatus}
            goodsId={details.id}
            stock={details.stock}
            title={details.title}
          />
        </aside>
      </main>
    </div>
  );
}

function ReviewItem({ review }: { review: GoodsReview }) {
  return (
    <article className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{review.reviewerName}</p>
          <p className="mt-1 truncate text-xs text-white/38">{review.reviewerEmail}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/8 px-2 py-1 text-xs font-semibold text-white/70">
          {review.rating}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/62">{review.comment}</p>
      <time className="mt-2 block text-xs text-white/35">{formatDate(review.date)}</time>
    </article>
  );
}

function getGallery(details: GoodsDetails) {
  if (details.images.length > 0) return details.images;
  return details.thumbnail ? [details.thumbnail] : [];
}

function getSpecs(details: GoodsDetails) {
  return [
    { label: 'SKU', value: details.sku },
    { label: '库存', value: details.stock?.toString() },
    { label: '发货', value: details.shippingInformation },
    { label: '售后', value: details.returnPolicy },
    { label: '质保', value: details.warrantyInformation },
    { label: '起订量', value: details.minimumOrderQuantity?.toString() },
    { label: '重量', value: details.weight === undefined ? undefined : `${details.weight} kg` },
    { label: '尺寸', value: formatDimensions(details.dimensions) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function formatDimensions(dimensions?: GoodsDimensions) {
  if (!dimensions) return undefined;

  return `${dimensions.width} x ${dimensions.height} x ${dimensions.depth}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
