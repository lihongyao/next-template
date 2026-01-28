/**
 * API 核心配置
 * 2026 最佳实践：集中管理所有配置
 */

/**
 * 获取 API 基础地址
 * 支持客户端和服务端不同的 base URL
 */
export function getBaseURL(): string {
  // 客户端优先使用客户端专用 URL（如果有）
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL_C) {
    return process.env.NEXT_PUBLIC_API_BASE_URL_C;
  }
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
  /** 默认超时时间（毫秒） */
  timeout: 60000,
  /** 默认重试次数 */
  retry: 0,
  /** 默认是否需要登录 */
  isLogin: false,
  /** 默认是否跳过认证 */
  skipAuth: false,
} as const;

/**
 * 重试配置
 */
export const RETRY_CONFIG = {
  /** 初始延迟时间（毫秒） */
  initialDelay: 300,
  /** 最大延迟时间（毫秒） */
  maxDelay: 10000,
  /** 指数退避基数 */
  backoffMultiplier: 2,
} as const;

/**
 * 开发环境配置
 */
export const DEV_CONFIG = {
  /** 是否启用请求日志 */
  enableRequestLog: process.env.NODE_ENV === 'development',
  /** 是否启用详细错误信息 */
  enableVerboseErrors: process.env.NODE_ENV === 'development',
} as const;
