import type { ReactNode } from 'react';
import { Fragment } from 'react';

import type { CarouselClientProps } from './CarouselClient';
import CarouselClient from './CarouselClient';

export type { CarouselDesktopColumns, CarouselRef, CarouselState } from './CarouselClient';

type CarouselProps<T = unknown> = Omit<CarouselClientProps, 'children'> & {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
};

export default function Carousel<T = unknown>({ items, renderItem, ...props }: CarouselProps<T>) {
  return (
    <CarouselClient {...props}>
      {items.map((item, index) => (
        <Fragment key={index}>{renderItem(item, index)}</Fragment>
      ))}
    </CarouselClient>
  );
}
