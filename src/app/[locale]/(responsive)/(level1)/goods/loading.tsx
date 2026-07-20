import GoodsCatalogSkeleton from './components/GoodsCatalogSkeleton';
import GoodsPageHeader from './components/GoodsPageHeader';

export default function Loading() {
  return (
    <main className="min-h-[calc(100dvh-56px)] bg-[#101010] text-white">
      <GoodsPageHeader />
      <GoodsCatalogSkeleton />
    </main>
  );
}
