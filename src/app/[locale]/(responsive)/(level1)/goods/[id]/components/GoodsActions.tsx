'use client';

import { useState } from 'react';

import Icon from '@/components/ui/Icon';

type GoodsActionsProps = {
  availabilityStatus?: string;
  goodsId: number;
  stock?: number;
  title: string;
};

export default function GoodsActions({
  availabilityStatus,
  goodsId,
  stock,
  title,
}: GoodsActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const canBuy = stock === undefined || stock > 0;
  const stockLabel =
    stock === undefined ? availabilityStatus : `${availabilityStatus || 'In Stock'} · ${stock}`;

  function handleDecrease() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function handleIncrease() {
    setQuantity((current) => current + 1);
  }

  function handleToggleFavorite() {
    setIsFavorite((current) => !current);
    // TODO: 接入收藏接口，参数可使用 goodsId/title。
  }

  function handleAddToCart() {
    // TODO: 接入加入购物车逻辑，提交 goodsId 和 quantity。
  }

  function handleBuyNow() {
    // TODO: 接入立即购买逻辑，提交 goodsId 和 quantity。
  }

  return (
    <section className="rounded-[8px] bg-[#161616] p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-white/45">{stockLabel}</p>
        </div>
        <button
          aria-label={isFavorite ? '取消收藏' : '收藏商品'}
          className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-white/8 text-white"
          type="button"
          onClick={handleToggleFavorite}
        >
          <Icon
            name="favorites"
            className="size-4"
            color={isFavorite ? '#31ED87' : 'currentColor'}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[8px] bg-[#202020] px-3 py-2">
        <span className="text-sm text-white/70">数量</span>
        <div className="flex items-center gap-3">
          <button
            aria-label="减少数量"
            className="flex size-7 items-center justify-center rounded-[6px] bg-white/8 text-lg leading-none text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={quantity <= 1}
            type="button"
            onClick={handleDecrease}
          >
            -
          </button>
          <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
          <button
            aria-label="增加数量"
            className="flex size-7 items-center justify-center rounded-[6px] bg-white/8 text-lg leading-none text-white"
            type="button"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-[8px] bg-linear-90 from-[#31ED87] to-[#95E974] px-4 text-sm font-extrabold text-[#1C2532] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canBuy}
          type="button"
          onClick={handleAddToCart}
        >
          <Icon name="cart" className="size-4" color="currentColor" />
          加入购物车
        </button>
        <button
          className="h-10 rounded-[8px] border border-white/10 bg-white/8 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!canBuy}
          type="button"
          onClick={handleBuyNow}
        >
          立即购买
        </button>
      </div>
    </section>
  );
}
