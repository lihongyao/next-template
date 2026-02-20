'use client';

import type { CardProps } from '.';

export default function Card(props: CardProps) {
  return (
    <div data-name="Card">
      <h3>{props?.name}</h3>
      <ul>
        {props?.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
