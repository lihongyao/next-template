import SwiperGameList from '@/components/features/SwiperGameList';

export default function DemoPage() {
  return (
    <div data-name="Demo" className="flex w-full flex-col gap-4 bg-black p-3">
      <SwiperGameList />
      <SwiperGameList />
      <SwiperGameList />
    </div>
  );
}
