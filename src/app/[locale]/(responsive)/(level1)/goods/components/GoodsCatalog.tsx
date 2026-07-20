'use client';

import { useMemo, useState } from 'react';

import type { ProductListItem } from '@/api/modules/product';
import Icon from '@/components/ui/Icon';
import { cn } from '@/libs/class-helpers';

import GoodsCard from './GoodsCard';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc';

type GoodsCatalogProps = {
  products: ProductListItem[];
};

const ALL_CATEGORY = 'all';

export default function GoodsCatalog({ products }: GoodsCatalogProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [sort, setSort] = useState<SortOption>('featured');

  const categories = useMemo(
    () => [ALL_CATEGORY, ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = category === ALL_CATEGORY || product.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.title, product.brand, product.category].some((value) =>
          value?.toLowerCase().includes(normalizedQuery),
        );

      return matchesCategory && matchesQuery;
    });

    return filtered.toSorted((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating-desc') return (b.rating ?? 0) - (a.rating ?? 0);
      return 0;
    });
  }, [category, products, query, sort]);

  const resetFilters = () => {
    setQuery('');
    setCategory(ALL_CATEGORY);
    setSort('featured');
  };

  return (
    <section className="mx-auto max-w-[1200px] px-3 pt-4 pb-8 sm:px-5 md:px-6 md:pt-5">
      <div className="rounded-[8px] border border-white/[0.06] bg-[#171717] p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-[340px]">
            <span className="sr-only">搜索商品</span>
            <Icon
              name="search"
              className="size-4"
              color="currentColor"
              wrapperClass="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-white/38"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索商品、品牌或分类"
              className="h-11 w-full rounded-[6px] border border-white/10 bg-[#212121] pr-3 pl-10 text-sm text-white transition outline-none placeholder:text-white/30 hover:border-white/16 focus:border-[#31ED87]/60 focus:ring-2 focus:ring-[#31ED87]/12"
            />
          </label>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <span className="text-xs text-white/42">
              显示 <strong className="font-semibold text-white/72">{visibleProducts.length}</strong>{' '}
              件商品
            </span>
            <label>
              <span className="sr-only">商品排序</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="h-11 rounded-[6px] border border-white/10 bg-[#212121] px-3 text-sm font-semibold text-white/78 transition outline-none hover:border-white/16 focus:border-[#31ED87]/60 focus:ring-2 focus:ring-[#31ED87]/12"
              >
                <option value="featured">推荐排序</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
                <option value="rating-desc">评分优先</option>
              </select>
            </label>
          </div>
        </div>

        <div className="no-scrollbar mt-3 overflow-x-auto">
          <div className="flex w-max items-center gap-2">
            {categories.map((item) => {
              const selected = item === category;

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(item)}
                  className={cn(
                    'h-9 shrink-0 rounded-[6px] border px-3 text-xs font-semibold transition active:scale-[0.97]',
                    selected
                      ? 'border-[#31ED87]/50 bg-[#31ED87]/12 text-[#31ED87]'
                      : 'border-white/8 bg-white/[0.03] text-white/52 hover:border-white/16 hover:text-white/76',
                  )}
                >
                  {item === ALL_CATEGORY ? '全部' : formatCategory(item)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {visibleProducts.map((item) => (
            <GoodsCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <Icon
            name="search"
            className="size-7"
            color="currentColor"
            wrapperClass="text-white/25"
          />
          <h2 className="mt-4 text-base font-bold text-white">没有找到匹配的商品</h2>
          <p className="mt-1 text-sm text-white/42">换个关键词或清除当前分类筛选。</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 h-10 rounded-[6px] bg-[#31ED87] px-4 text-sm font-bold text-[#122019] transition hover:bg-[#58F09A] active:scale-[0.97]"
          >
            清除筛选
          </button>
        </div>
      )}
    </section>
  );
}

function formatCategory(category: string) {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
