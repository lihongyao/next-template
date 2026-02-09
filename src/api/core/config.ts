/**
 * API 配置
 *
 * 集中管理 baseURL、token 存储 key、刷新路径及默认超时/重试参数。
 */

/** Cookie 中存储的 token 键名 */
export const TOKEN_STORAGE_KEY = 'AUTHORIZATION_TOKEN';

/** 刷新 token 的接口路径（相对 baseURL） */
export const REFRESH_TOKEN_PATH = '/v1/token/refresh';

/**
 * 获取 API 基础地址
 * 客户端优先用 NEXT_PUBLIC_API_BASE_URL_C，服务端用 NEXT_PUBLIC_API_HOST_S
 */
export function getBaseURL(): string {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL_C) {
    return process.env.NEXT_PUBLIC_API_BASE_URL_C;
  }
  return process.env.NEXT_PUBLIC_API_HOST_S ?? '';
}

/** 默认请求配置 */
export const DEFAULT_CONFIG = {
  timeout: 60_000,
  retry: 0,
} as const;

/** 重试策略：指数退避 */
export const RETRY_CONFIG = {
  initialDelay: 300,
  maxDelay: 10_000,
  backoffMultiplier: 2,
} as const;

/** 开发环境：是否打印请求日志 */
export const DEV_CONFIG = {
  enableRequestLog: process.env.NODE_ENV === 'development',
} as const;
