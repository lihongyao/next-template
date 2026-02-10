'use client';
import { useRouter } from '@/i18n/navigation';

export default function Header() {
  const rouetr = useRouter();
  return (
    <header className="flex h-[49px] items-center justify-center bg-black px-3">
      <div
        className="text-white"
        onClick={() => {
          rouetr.back();
        }}
      >
        返回
      </div>
    </header>
  );
}
