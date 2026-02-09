/**
 * 统一 API 请求入口
 *
 * - Token 存 Cookie（兼容客户端 + 服务端组件，替代 SPA 时代的 localStorage）；
 * - 请求时从 Cookie 取出 token，放入请求头 Authorization: Bearer <token> 发给后端；
 * - 客户端/服务端共用同一套 api / get / post / put / patch / del；
 * - 响应按 BaseResponse { code, data, message } 解析，成功时只返回 data；
 * - Token 过期时在客户端自动刷新并重试一次。
 */
import { getBaseURL } from './core/config';
import { baseFetch } from './core/fetch';
import { getRefreshedToken } from './core/refresh';
import { getToken } from './core/token';
import type { RequestOptions } from './core/types';
import { ApiError, ErrorCode } from './core/types';

function buildUrl(
  url: string,
  params?: string | Record<string, string | number | boolean>,
): string {
  const base = getBaseURL();
  const full = url.startsWith('http') ? url : `${base}${url}`;
  if (!params) return full;
  if (typeof params === 'string') return full + (full.includes('?') ? '&' : '?') + params;
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.append(k, String(v));
  });
  const s = q.toString();
  return s ? full + (full.includes('?') ? '&' : '?') + s : full;
}

/**
 * 统一请求：自动带 Cookie 中的 token、解析 BaseResponse 只返回 data、支持 isLogin / noCache / retry / timeout
 */
export async function api<T = unknown>(
  url: string,
  options: RequestOptions & { isLogin?: boolean } = {},
): Promise<T> {
  const { isLogin = false, skipAuth, noCache = 'auto', retry, timeout, ...rest } = options;
  const method = rest.method ?? 'GET';
  const fullUrl = method === 'GET' && rest.params ? buildUrl(url, rest.params) : buildUrl(url);
  let token: string | undefined;
  if (!skipAuth) {
    token = (await getToken())?.token ?? undefined;
  }
  if (isLogin && !token) {
    throw new ApiError(ErrorCode.LOGIN_REQUIRED, '请登录');
  }

  const headers = new Headers(rest.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (rest.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const nc = noCache === true;
  const vary = noCache === false ? !!token : noCache === 'auto' ? !!token : false;
  if (nc) {
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  } else if (vary && token) {
    headers.set('Vary', 'Authorization, Cookie');
  }

  const fetchOptions: RequestInit = {
    ...rest,
    method,
    headers,
    body: rest.body,
  };

  try {
    return await baseFetch<T>(fullUrl, fetchOptions, retry ?? 0, timeout ?? 60_000);
  } catch (e) {
    const isClient = typeof window !== 'undefined';
    if (e instanceof ApiError && e.code === ErrorCode.TOKEN_EXPIRED && isClient) {
      token = await getRefreshedToken();
      headers.set('Authorization', `Bearer ${token}`);
      return api<T>(url, { ...options, headers });
    }
    throw e;
  }
}

/** GET */
export function get<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method' | 'body'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'GET' });
}

/** POST */
export function post<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'POST' });
}

/** PUT */
export function put<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'PUT' });
}

/** PATCH */
export function patch<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'PATCH' });
}

/** DELETE */
export function del<T = unknown>(
  url: string,
  options?: Omit<RequestOptions, 'method' | 'body'> & { isLogin?: boolean },
): Promise<T> {
  return api<T>(url, { ...options, method: 'DELETE' });
}
