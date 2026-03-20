'use client';

import { useRouter } from '@/router';

export default function NavBarDesktop({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div data-name="nav-bar-desktop" className="isMobile flex h-12 items-center gap-3">
      <div onClick={() => router.back()}>&glt;</div>
      <span className="text-lg font-bold text-white">{title}</span>
    </div>
  );
}
