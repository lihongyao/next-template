import { use } from 'react';

import type { ProductListResponse } from '@/api/modules/product';

import GoodsCatalog from './GoodsCatalog';

type GoodsCatalogContentProps = {
  productsPromise: Promise<ProductListResponse>;
};

export default function GoodsCatalogContent({ productsPromise }: GoodsCatalogContentProps) {
  const data = use(productsPromise);

  return <GoodsCatalog products={data.products} />;
}
