// src/components/ui/Icon/index.tsx
import type React from 'react';

import {
  SVG_COMPONENT_MAP,
  SVG_ICON_KIND_MAP,
  SVG_SPRITE_FILE_MAP,
  SVG_SPRITE_ID_MAP,
  type SvgPathName,
} from '@/assets/svg/generated';
import { cn } from '@/libs/class-helpers';

export type RemoteIconUrl = `http://${string}` | `https://${string}`;
export type IconName = SvgPathName | RemoteIconUrl;

export type IconProps = {
  name: IconName;
  color?: string;
  alt?: string;
  wrapperClass?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
} & Omit<React.SVGProps<SVGSVGElement>, 'name' | 'color'>;

function isRemoteIconName(name: IconName): name is RemoteIconUrl {
  return name.startsWith('http');
}

export default function Icon(props: IconProps) {
  const { name, color, style, className, wrapperClass, alt, onClick, ...rest } = props;

  const isRemoteImage = isRemoteIconName(name);
  const svgName = isRemoteImage ? undefined : name;
  const componentMap = SVG_COMPONENT_MAP as Partial<
    Record<SvgPathName, React.ComponentType<React.SVGProps<SVGSVGElement>>>
  >;
  const spriteIdMap = SVG_SPRITE_ID_MAP as Partial<Record<SvgPathName, string>>;
  const spriteFileMap = SVG_SPRITE_FILE_MAP as Partial<Record<SvgPathName, string>>;
  const iconKind = svgName ? SVG_ICON_KIND_MAP[svgName] : undefined;
  const Comp = svgName ? componentMap[svgName] : undefined;
  const spriteId = svgName ? spriteIdMap[svgName] : undefined;
  const spriteFile = svgName ? spriteFileMap[svgName] : undefined;

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
      {iconKind === 'sprite-inline' && spriteId && (
        <svg
          {...rest}
          {...a11yProps}
          className={className}
          style={{
            ...(color ? { color } : null),
            ...style,
          }}
        >
          <use href={`#${spriteId}`} />
        </svg>
      )}
      {iconKind === 'sprite-external' && spriteId && spriteFile && (
        <svg
          {...rest}
          {...a11yProps}
          className={className}
          style={{
            ...(color ? { color } : null),
            ...style,
          }}
        >
          <use href={`${spriteFile}#${spriteId}`} />
        </svg>
      )}
      {isRemoteImage && !iconKind && (
        <img src={name} className={cn('shrink-0', className)} alt={alt || 'icon'} />
      )}
      {!iconKind && !isRemoteImage && svgName && <span className="text-base">❌</span>}
    </div>
  );
}
