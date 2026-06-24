// src/components/ui/Icon/index.tsx
import type React from 'react';

import {
  SVG_COMPONENT_MAP,
  SVG_ICON_KIND_MAP,
  SVG_SPRITE_FILE,
  SVG_SPRITE_ID_MAP,
  type SvgPathName,
} from '@/assets/svg/generated';
import { cn } from '@/libs/class-helpers';

export type IconProps = {
  name?: SvgPathName;
  src?: string;
  color?: string;
  alt?: string;
  wrapperClass?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
} & Omit<React.SVGProps<SVGSVGElement>, 'name' | 'color'>;

export default function Icon(props: IconProps) {
  const { name, src, color, style, className, wrapperClass, alt, onClick, ...rest } = props;

  const isRemoteImage = Boolean(src?.startsWith('http'));
  const svgName = (name || (!isRemoteImage ? src : '') || '') as SvgPathName;
  const componentMap = SVG_COMPONENT_MAP as Partial<
    Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>
  >;
  const spriteIdMap = SVG_SPRITE_ID_MAP as Partial<Record<SvgPathName, string>>;
  const iconKind = svgName ? SVG_ICON_KIND_MAP[svgName] : undefined;
  const Comp = svgName ? componentMap[svgName] : undefined;
  const spriteId = svgName ? spriteIdMap[svgName] : undefined;

  const a11yProps = alt
    ? { role: 'img', 'aria-label': alt }
    : { 'aria-hidden': true, focusable: false as const };

  return (
    <div
      data-name={svgName || 'icon'}
      className={cn('flex items-center justify-center text-[0px]', wrapperClass)}
      onClick={onClick}
    >
      {iconKind === 'svgr' && Comp && (
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
      {iconKind === 'sprite' && spriteId && (
        <svg
          {...rest}
          {...a11yProps}
          className={className}
          style={{
            ...(color ? { color } : null),
            ...style,
          }}
        >
          <use href={`${SVG_SPRITE_FILE}#${spriteId}`} />
        </svg>
      )}
      {src && isRemoteImage && !iconKind && (
        <img src={src} className={cn('shrink-0', className)} alt={alt || 'icon'} />
      )}
      {!iconKind && !isRemoteImage && svgName && <span className="text-base">❌</span>}
    </div>
  );
}
