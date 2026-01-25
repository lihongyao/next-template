// src/configs/brands/types.ts
// -- 主题
export type Theme = 'classic' | 'modern';
// -- 皮肤
export type Skin = 'green' | 'blue';
// -- 布局
export type Layout = 'top-nav' | 'side-nav';

// -- 语言配置
export type Locale = {
  /** 语言描述 */
  label: string;
  /** 语言标识 */
  code: string;
  /** 语言数值 */
  value: number;
};

// -- 品牌配置
export type BrandConfig = {
  /** 应用名称 */
  appName: string;
  /** 主题 */
  theme: Theme;
  /** 皮肤 */
  skin: Skin;
  /** 布局 */
  layout: Layout;
  /** 支持的语言 */
  locales: Locale[];
  /** 默认语言 */
  defaultLocale: string;
  /** 是否启用覆盖 */
  overrides?: boolean;
  /** 扩展字段 */
  [key: string]: unknown;
};
