import type React from 'react';

import iconMap from '@/assets/svg/generated';
import { cn } from '@/libs/class-helpers';

import type { SvgPathName } from './svgPath_all';

export type IconProps = {
  name?: SvgPathName;
  src?: string;
  color?: string;
  alt?: string;
  wrapperClass?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
} & Omit<React.SVGProps<SVGSVGElement>, 'name' | 'color'>;

export default function Icon(props: IconProps) {
  const { name, src, color, style, className, wrapperClass, alt, onClick, ...rest } = props;

  const svgName = (name || (src?.startsWith('http') ? '' : src) || '') as SvgPathName;
  let Comp = null;
  if (svgName) {
    Comp = iconMap[svgName];
  }

  const a11yProps = alt
    ? { role: 'img', 'aria-label': alt }
    : { 'aria-hidden': true, focusable: false as const };

  return (
    <div
      data-name={svgName || 'icon'}
      className={cn('flex items-center justify-center text-[0px]', wrapperClass)}
      onClick={onClick}
    >
      {Comp && (
        <Comp
          {...rest}
          {...a11yProps}
          className={className}
          style={{
            ...(color ? { color } : null),
            ...style,
          }}
        />
      )}
      {src && !Comp && <img src={src} className={className} alt={alt || 'icon'} />}
    </div>
  );
}
