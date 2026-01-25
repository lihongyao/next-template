// src/lib/brand.ts
import type { BrandConfig } from '@/configs/brands/types';

/**
 * SSR 读取品牌配置
 * 优先级：cookie > 环境变量 > 默认品牌
 */
export async function getBrandConfigSSR(): Promise<BrandConfig> {
  // 1. 根据环境变量，读取包网配置
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'afun';
  const module = await import(`@/configs/brands/${brandName}.ts`);
  const brandConfig = module.default as BrandConfig;
  // 2. 返回包网配置
  return { ...brandConfig };
}
