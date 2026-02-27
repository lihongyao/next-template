'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/libs/class-helpers';

interface ProgressiveImageProps {
  className?: string;
  src: string;
  blurSrc: string;
  alt: string;
}
export default function ProgressiveImage({ className, src, blurSrc, alt }: ProgressiveImageProps) {
  const [renderSrc, setRenderSrc] = useState(blurSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setRenderSrc(src);
      setLoaded(true);
    };
  }, [src]);

  return (
    <div className={cn('h-full w-full', !loaded && 'bg-black')}>
      <img
        className={cn('h-full w-full object-cover', className)}
        src={renderSrc}
        alt={alt}
        loading="lazy"
      />
    </div>
  );
}
