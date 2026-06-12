// src/app/[lang]/_components/Card.tsx
import { getBrandConfigSSR } from '@/libs/brand';
import { getImageUrl } from '@/libs/cdn-image';

import ClientInfo from './ClientInfo';
import ServerInfo from './ServerInfo';

export default async function Card() {
  const brand = await getBrandConfigSSR();
  return (
    <div className="flex gap-4 rounded-(--card-radius) border border-(--card-border-color) bg-(--card-bg) p-(--card-padding) text-(--card-text)">
      <img src={getImageUrl('banner.jpg')} alt="banner" className="w-[300px]" />
      <div className="space-y-4">
        <p>Example card. Colors and radius come from theme/skin tokens.</p>
        <button
          type="button"
          className="inline-block bg-(--color-primary) px-4 py-2 text-sm text-white"
        >
          Primary
        </button>
        <div className="flex items-center gap-4">
          <ClientInfo />
          <div className="mx-4 h-10 w-px bg-gray-400"></div>
          <ServerInfo />
        </div>
      </div>
    </div>
  );
}
