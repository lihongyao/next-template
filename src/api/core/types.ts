/**
 * API 核心类型
 *
 * 后端统一响应格式 BaseResponse { code, data, message }；请求配置 RequestOptions；统一错误 ApiError。
 */

/**
 * 后端统一响应壳：{ code, data, message }
 * 约定：请求到了后端则 HTTP 状态码为成功（如 200），用 code 区分业务成功/失败；0 成功，401 需要登录，402 token 过期。
 */
export interface BaseResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/** 登录态：存 Cookie，含 access token 与 refresh token */
export interface TokenData {
  token: string;
  refreshToken: string;
}

/** 请求配置：在 RequestInit 基础上增加 params / timeout / retry / isLogin / noCache 等 */
export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  /** GET 时拼到 URL 的查询参数 */
  params?: string | Record<string, string | number | boolean>;
  /** 超时 ms，默认 60000 */
  timeout?: number;
  /** 重试次数，默认 0，仅对网络类错误重试 */
  retry?: number;
  /** 为 true 时若无 token 直接抛 LOGIN_REQUIRED */
  isLogin?: boolean;
  /** 为 true 时不带 Authorization */
  skipAuth?: boolean;
  /** true 禁用缓存；false 允许并加 Vary；'auto' 按是否带 token 决定 */
  noCache?: boolean | 'auto';
  headers?: HeadersInit;
  signal?: AbortSignal;
}

/** 业务错误码常量（与后端约定一致） */
export const ErrorCode = {
  /** 需要登录 */
  LOGIN_REQUIRED: 401,
  /** Token 过期 */
  TOKEN_EXPIRED: 402,
  UNAUTHORIZED: 401,
  TIMEOUT: 408,
  SERVER_ERROR: 500,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** 统一 API 错误：含 code、message、可选 data 与 HTTP status */
export class ApiError extends Error {
  code: number;
  data?: unknown;
  status?: number;

  constructor(code: number, message: string, data?: unknown, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
    this.status = status;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
