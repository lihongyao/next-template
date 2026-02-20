import type { BannerProps } from '.';

export default function BannerSuspense(props: BannerProps) {
  return (
    <div data-name="BannerSuspense">
      <h2>{props?.title}</h2>
      <ul>
        {props?.banners.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
