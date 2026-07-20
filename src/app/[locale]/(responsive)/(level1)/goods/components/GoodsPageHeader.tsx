export default function GoodsPageHeader() {
  return (
    <header className="border-b border-white/[0.06] bg-[#141414]">
      <div className="mx-auto max-w-[1200px] px-3 py-5 sm:px-5 md:px-6 md:py-6">
        <p className="text-xs font-semibold text-[#31ED87] uppercase">Goods</p>
        <h1 className="mt-1 text-2xl leading-tight font-black text-white md:text-[28px]">
          商品精选
        </h1>
        <p className="mt-2 max-w-[560px] text-sm leading-5 text-white/48">
          从美妆、家居到日常好物，找到值得加入清单的新选择。
        </p>
      </div>
    </header>
  );
}
