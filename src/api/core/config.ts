/**
 * API 核心配置
 */

/**
 * 获取 API 基础地址
 */
export function getBaseURL(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
}

/**
 * Token 存储 Key
 */
export const TOKEN_STORAGE_KEY = 'AUTHORIZATION_TOKEN';

/**
 * Token 刷新接口路径
 */
export const REFRESH_TOKEN_PATH = '/v1/token/refresh';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  timeout: 60000,
  retry: 0,
  isLogin: false,
  skipAuth: false,
} as const;
