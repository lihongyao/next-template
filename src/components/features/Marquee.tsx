export default function Marquee() {
  return (
    <div className="relative flex w-full overflow-hidden">
      <div className="animate-marquee flex min-w-full shrink-0 items-center whitespace-nowrap">
        <span className="mx-4 text-xl">这是滚动信息 1</span>
        <span className="mx-4 text-xl">这是滚动信息 2</span>
        <span className="mx-4 text-xl">这是滚动信息 3</span>
        <span className="mx-4 text-xl">这是滚动信息 4</span>
        <span className="mx-4 text-xl">这是滚动信息 5</span>
        <span className="mx-4 text-xl">这是滚动信息 6</span>
        <span className="mx-4 text-xl">这是滚动信息 7</span>
      </div>
      <div
        className="animate-marquee flex min-w-full shrink-0 items-center whitespace-nowrap"
        aria-hidden="true"
      >
        <span className="mx-4 text-xl">这是滚动信息 1</span>
        <span className="mx-4 text-xl">这是滚动信息 2</span>
        <span className="mx-4 text-xl">这是滚动信息 3</span>
        <span className="mx-4 text-xl">这是滚动信息 4</span>
        <span className="mx-4 text-xl">这是滚动信息 5</span>
        <span className="mx-4 text-xl">这是滚动信息 6</span>
        <span className="mx-4 text-xl">这是滚动信息 7</span>
      </div>
    </div>
  );
}
