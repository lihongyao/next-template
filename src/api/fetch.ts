/**
 * 统一 API 请求函数
 * 自动识别客户端/服务端环境，无需区分调用方式
 *
 * 2026 最佳实践：一个函数，自动适配所有场景
 */
import { getBaseURL } from './core/config';
import { baseFetch } from './core/fetch';
import { getRefreshedToken } from './core/refresh';
import { getTokenString } from './core/token';
import type { RequestOptions } from './core/types';
import { ApiError, ErrorCode } from './core/types';

/**
 * 构建完整 URL（处理查询参数）
 */
function buildFullUrl(
  url: string,
  params?: string | Record<string, string | number | boolean>,
): string {
  const BASE_URL = getBaseURL();
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  if (!params) {
    return fullUrl;
  }

  // 如果是字符串，直接拼接
  if (typeof params === 'string') {
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}${params}`;
  }

  // 如果是对象，转换为 URLSearchParams
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  if (queryString) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}${queryString}`;
  }

  return fullUrl;
}

/**
 * 统一 API 请求函数
 *
 * 自动识别运行环境：
 * - 客户端：从 Cookie 读取 token，支持 token 刷新
 * - 服务端：从 headers 的 cookie 读取 token
 *
 * @param url 请求路径（相对于 baseURL）
 * @param options 请求配置
 * @param options.isLogin 是否需要登录（默认 false）
 * @param options.serverHeaders 服务端请求头（用于获取 cookie，仅在服务端有效）
 * @returns 响应数据
 *
 * @example
 * ```ts
 * // 客户端组件
 * 'use client';
 * const user = await api('/users/1');
 *
 * // 服务端组件
 * import { headers } from 'next/headers';
 * const serverHeaders = await headers();
 * const user = await api('/users/1', { serverHeaders });
 *
 * // 需要登录的接口
 * const profile = await api('/user/profile', { isLogin: true });
 * ```
 */
export async function api<T = unknown>(
  url: string,
  options: RequestOptions & {
    /** 是否需要登录（默认 false） */
    isLogin?: boolean;
  } = {},
): Promise<T> {
  const { isLogin = false, serverHeaders, ...restOptions } = options;

  // 处理查询参数（GET 请求）
  const method = restOptions.method || 'GET';
  let fullUrl = url;
  let body = restOptions.body;

  if (method === 'GET' && restOptions.params) {
    fullUrl = buildFullUrl(url, restOptions.params);
  } else {
    fullUrl = buildFullUrl(url);
  }

  // 自动获取 token（统一从 Cookie 读取）
  // 客户端：从 Cookie 读取（通过 cookie-helper）
  // 服务端：从 serverHeaders 的 cookie 读取
  const isClient = typeof window !== 'undefined';
  let token: string | undefined;

  if (!restOptions.skipAuth) {
    // 统一使用 getTokenString，自动识别环境
    // 客户端会从 Cookie 读取，服务端会从 headers 的 cookie 读取
    token = (await getTokenString(serverHeaders)) || undefined;
  }

  // 检查登录要求
  if (isLogin && !token) {
    throw new ApiError(ErrorCode.LOGIN_REQUIRED, '请登录');
  }

  // 设置 headers
  const headers = new Headers(restOptions.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 对于有 body 的请求，设置 Content-Type
  if (body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 缓存控制策略
  // 重要：每个用户的 Cookie 中的 token 是不同的，所以可以安全地使用缓存
  // 使用 Vary 头让 CDN 根据不同的 token 缓存不同的响应
  const cacheControl = restOptions.noCache ?? 'auto';
  let shouldNoCache = false;
  let shouldVary = false;

  if (cacheControl === true) {
    // 明确要求完全禁用缓存
    shouldNoCache = true;
  } else if (cacheControl === false) {
    // 明确要求允许缓存，使用 Vary 头区分不同 token
    shouldNoCache = false;
    shouldVary = !!token; // 如果有 token，使用 Vary 头
  } else {
    // 'auto': 智能判断
    // 如果请求包含 token，使用 Vary 头允许缓存（每个用户的 token 不同，缓存是安全的）
    // 如果请求不包含 token，允许缓存（公开接口）
    shouldNoCache = false;
    shouldVary = !!token; // 有 token 时使用 Vary 头
  }

  if (shouldNoCache) {
    // 完全禁用缓存
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else if (shouldVary && token) {
    // 允许缓存，但使用 Vary 头确保不同 token 的响应分别缓存
    // 这样 CDN 会根据不同的 Authorization header 缓存不同的响应
    // 每个用户的 token 不同，所以每个用户的响应会被分别缓存，是安全的
    headers.set('Vary', 'Authorization, Cookie');
    // 不设置 Cache-Control，让后端或 CDN 决定缓存策略
  }
  // 如果没有 token 且允许缓存，不设置任何缓存控制头，让后端决定

  const fetchOptions: RequestInit = {
    ...restOptions,
    method,
    headers,
    body,
  };

  try {
    // 执行请求
    const data = await baseFetch<T>(
      fullUrl,
      fetchOptions,
      restOptions.retry ?? 0,
      restOptions.timeout,
    );
    return data;
  } catch (err: unknown) {
    // Token 过期处理（仅在客户端支持刷新）
    if (err instanceof ApiError && err.code === ErrorCode.TOKEN_EXPIRED && isClient) {
      // 刷新 token
      token = await getRefreshedToken();
      headers.set('Authorization', `Bearer ${token}`);

      // 重试请求
      return api<T>(url, { ...options, headers });
    }

    // 其他错误直接抛出
    throw err;
  }
}

/**
 * 便捷方法：GET 请求
 */
export async function get<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method' | 'body'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'GET' });
}

/**
 * 便捷方法：POST 请求
 */
export async function post<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'POST' });
}

/**
 * 便捷方法：PUT 请求
 */
export async function put<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'PUT' });
}

/**
 * 便捷方法：PATCH 请求
 */
export async function patch<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'PATCH' });
}

/**
 * 便捷方法：DELETE 请求
 */
export async function del<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method' | 'body'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'DELETE' });
}
