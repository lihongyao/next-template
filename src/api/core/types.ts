/**
 * API 核心类型定义
 */

/**
 * API 响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码：0 或 200 表示成功 */
  code: number;
  /** 响应数据 */
  data: T;
  /** 响应消息 */
  msg: string;
}

/**
 * Token 数据格式
 */
export interface TokenData {
  token: string;
  refreshToken: string;
}

/**
 * 请求配置
 */
export interface RequestOptions extends RequestInit {
  /** 请求超时时间（毫秒，默认 60000） */
  timeout?: number;
  /** 重试次数（默认 0） */
  retry?: number;
  /** 是否需要登录（默认 false） */
  isLogin?: boolean;
  /** 是否跳过 token 注入（默认 false） */
  skipAuth?: boolean;
  /** GET 请求的查询参数（会自动转换为 URLSearchParams） */
  params?: string | Record<string, string | number | boolean>;
  /** 服务端请求时传入的 headers（用于获取 cookie） */
  serverHeaders?: Headers;
  /**
   * 缓存控制
   * - true: 完全禁用缓存
   * - false: 允许缓存，使用 Vary 头区分不同 token 的响应（推荐）
   * - 'auto': 自动判断（包含 token 时使用 Vary，否则允许缓存）
   */
  noCache?: boolean | 'auto';
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  /** 业务错误码 */
  code: number;
  /** 错误数据 */
  data?: unknown;
  /** HTTP 状态码 */
  status?: number;

  constructor(code: number, message: string, data?: unknown, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
    this.status = status;

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * 业务错误码常量
 */
export const ErrorCode = {
  /** 需要登录 */
  LOGIN_REQUIRED: 10001,
  /** Token 过期 */
  TOKEN_EXPIRED: 10002,
  /** 未授权 */
  UNAUTHORIZED: 401,
  /** 请求超时 */
  TIMEOUT: 408,
  /** 服务器错误 */
  SERVER_ERROR: 500,
} as const;
