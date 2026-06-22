/**
 * 页面展示了基于 viewerjs 实现富文本中的图片点击预览功能。
 */
'use client';

import { useEffect, useRef } from 'react';

import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

import AppHeader from '@/components/ui/AppHeader';

import { notice_content as html } from './data';

export default function NoticePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const imgs = container.querySelectorAll('img');
    const dataSource = Array.from(imgs).map((img) => ({
      src: img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
    imgs.forEach((img, index) => {
      img.style.cursor = 'pointer';
      img.onclick = () => {
        const pswp = new PhotoSwipe({ dataSource, index });
        pswp.init();
      };
    });

    return () => {
      imgs.forEach((img) => {
        img.onclick = null;
      });
    };
  }, [html]);
  return (
    <div data-name="notice-page">
      <AppHeader title="通知" />
      <main className="p-3 text-white">
        <div
          ref={containerRef}
          className="rich-content overflow-hidden rounded-lg"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
