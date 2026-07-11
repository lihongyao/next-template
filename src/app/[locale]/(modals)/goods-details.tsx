'use client';

import { useEffect, useState } from 'react';

import { product } from '@/api/modules';
import GoodsDetailsView from '@/app/[locale]/(responsive)/(level1)/goods/[id]/components/GoodsDetailsView';
import type { GoodsDetails as GoodsDetailsData } from '@/app/[locale]/(responsive)/(level1)/goods/[id]/types';
import GoodsCardSkeleton from '@/components/features/goods/GoodsCardSkeleton';
import { useModalRoutes } from '@/hooks/useModalRoutes';
import { useModal } from '@/providers/modal.provider';
import { Routes } from '@/router/routes';

type LoadState =
  | { status: 'loading' }
  | { details: GoodsDetailsData; status: 'success' }
  | { message: string; status: 'error' };

export default function GoodsDetails() {
  const { closeModal } = useModal();
  const { getModalParams } = useModalRoutes();
  const goodsId = getModalParams(Routes.ModalGoodsDetails)[0];
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let ignore = false;

    if (!goodsId) {
      setLoadState({ message: '商品不存在', status: 'error' });
      return;
    }

    setLoadState({ status: 'loading' });

    product
      .details(+goodsId)
      .then((details) => {
        if (!ignore) setLoadState({ details, status: 'success' });
      })
      .catch(() => {
        if (!ignore) setLoadState({ message: '商品加载失败', status: 'error' });
      });

    return () => {
      ignore = true;
    };
  }, [goodsId]);

  return (
    <div
      data-name="goods-details-modal"
      className="max-h-[88dvh] w-[410px] overflow-hidden rounded-[8px] bg-[#101010] text-white shadow-2xl"
    >
      <header className="flex h-12 items-center justify-between border-b border-white/8 bg-[#161616] px-4">
        <h2 className="text-sm font-bold">商品详情</h2>
        <button
          aria-label="关闭商品详情"
          className="flex size-8 items-center justify-center rounded-[8px] bg-white/8 text-xl leading-none text-white"
          type="button"
          onClick={closeModal}
        >
          ×
        </button>
      </header>

      <div className="max-h-[calc(88dvh-48px)] overflow-y-auto">
        {loadState.status === 'loading' && <GoodsCardSkeleton variant="modal" />}
        {loadState.status === 'error' && (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-semibold">{loadState.message}</p>
            <button
              className="h-9 rounded-[8px] bg-white/8 px-4 text-sm font-semibold text-white"
              type="button"
              onClick={closeModal}
            >
              返回
            </button>
          </div>
        )}
        {loadState.status === 'success' && (
          <GoodsDetailsView details={loadState.details} variant="modal" />
        )}
      </div>
    </div>
  );
}
