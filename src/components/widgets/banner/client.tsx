'use client';
import type { BannerProps } from '.';

export default function Banner(props: BannerProps) {
  return (
    <div data-name="Banner">
      <h2>{props?.title}</h2>
      <ul>
        {props?.banners.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
