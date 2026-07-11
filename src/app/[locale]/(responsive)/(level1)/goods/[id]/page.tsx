import { Suspense } from 'react';

import { product } from '@/api/modules';
import GoodsCardSkeleton from '@/components/features/goods/GoodsCardSkeleton';
import AppHeader from '@/components/ui/AppHeader';

import GoodsDetailsContent from './components/GoodsDetailsContent';
import type { GoodsDetails } from './types';

export default function GoodsDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const detailsPromise: Promise<GoodsDetails> = params.then(({ id }) => product.details(+id));

  return (
    <div data-name="news-page">
      <AppHeader title="商品详情" />
      <Suspense fallback={<GoodsCardSkeleton />}>
        <GoodsDetailsContent detailsPromise={detailsPromise} />
      </Suspense>
    </div>
  );
}
