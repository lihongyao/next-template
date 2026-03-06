import SwiperGameList from '@/components/features/SwiperGameList';

export default function DemoPage() {
  return (
    <div
      data-name="Demo"
      className="flex min-h-screen w-full flex-col justify-start gap-4 bg-black p-3"
    >
      <SwiperGameList />
      <SwiperGameList />
      <SwiperGameList />
    </div>
  );
}
