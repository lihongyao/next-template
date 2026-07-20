import { Suspense } from 'react';

import { product } from '@/api/modules';
import type { ProductListResponse } from '@/api/modules/product';

import GoodsCatalogContent from './components/GoodsCatalogContent';
import GoodsCatalogSkeleton from './components/GoodsCatalogSkeleton';
import GoodsPageHeader from './components/GoodsPageHeader';

export default function GoodsPage() {
  const productsPromise: Promise<ProductListResponse> = product.list();

  return (
    <main data-name="goods-page" className="min-h-[calc(100dvh-56px)] bg-[#101010] text-white">
      <GoodsPageHeader />
      <Suspense fallback={<GoodsCatalogSkeleton />}>
        <GoodsCatalogContent productsPromise={productsPromise} />
      </Suspense>
    </main>
  );
}
