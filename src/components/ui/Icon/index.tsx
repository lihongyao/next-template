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
  /**
   * 图标名称或在线图片地址。
   * - 本地图标：使用 SvgPathName 中已生成的图标名称。
   * - 在线资源：支持以 http:// 或 https:// 开头的图片地址。
   * - 在线 .svg：仅支持单色 SVG，通过 color 属性修改颜色。
   * - 其他在线图片：使用 img 渲染，不支持通过 color 修改颜色。
   */
  name: IconName;
  /**
   * 图标颜色。在线 .svg 只能通过该属性修改颜色，且仅适用于单色 SVG。
   * 支持普通颜色值、currentColor 和 CSS 变量。
   */
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
  const isRemoteSvg = isRemoteImage && /\.svg(?:[?#]|$)/i.test(name);
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
      {isRemoteSvg && color && (
        <span
          role={alt ? 'img' : undefined}
          aria-label={alt}
          aria-hidden={alt ? undefined : true}
          className={cn('inline-block size-[1em] shrink-0', className)}
          style={{
            backgroundColor: color,
            WebkitMaskImage: `url("${name}")`,
            maskImage: `url("${name}")`,
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            ...style,
          }}
        />
      )}
      {isRemoteImage && (!isRemoteSvg || !color) && (
        <img src={name} className={cn('shrink-0', className)} style={style} alt={alt || 'icon'} />
      )}
      {!iconKind && !isRemoteImage && svgName && <span className="text-base">❌</span>}
    </div>
  );
}
