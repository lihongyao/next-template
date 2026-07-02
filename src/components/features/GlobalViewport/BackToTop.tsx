'use client';

import { useEffect, useState } from 'react';

import Icon from '@/components/ui/Icon';
import { ZIndex } from '@/constants/z-index';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisible = () => {
      setVisible(window.scrollY > window.innerHeight);
    };

    updateVisible();
    window.addEventListener('scroll', updateVisible, { passive: true });
    window.addEventListener('resize', updateVisible);

    return () => {
      window.removeEventListener('scroll', updateVisible);
      window.removeEventListener('resize', updateVisible);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      className="pointer-events-auto fixed top-1/2 right-6 flex h-[92px] w-[92px] -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-sm bg-[#181818] text-white transition-opacity duration-200 hover:opacity-90"
      style={{ zIndex: ZIndex.FloatingBar }}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <Icon name="arrow_up" className="size-[18px]" color="#31ED87" />
      <span className="mt-3 text-[15px] leading-none font-extrabold tracking-[0.08em]">TOP</span>
    </button>
  );
}
