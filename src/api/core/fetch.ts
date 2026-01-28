/**
 * 基础 Fetch 封装
 */
import type { ApiResponse } from './types';
import { ApiError, ErrorCode } from './types';

/**
 * 创建超时控制器
 */
function createTimeoutController(timeout: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return { controller, clear: () => clearTimeout(id) };
}

/**
 * 带重试的 fetch（指数退避）
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number,
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries) throw err;
      // 指数退避：300ms, 600ms, 1200ms, ...
      const delay = 300 * 2 ** i;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Should not reach here');
}

/**
 * 基础 Fetch 封装
 *
 * @param url 请求 URL
 * @param options 请求配置
 * @param retry 重试次数
 * @returns 响应数据（直接返回 data）
 */
export async function baseFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retry = 0,
): Promise<T> {
  const timeout = 60000; // 默认超时
  const { controller, clear } = createTimeoutController(timeout);

  // Fetch 缓存控制
  // 注意：如果设置了 Vary 头，CDN 会根据不同的 token 缓存不同的响应
  // 所以可以安全地使用缓存，不需要完全禁用
  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    // 使用默认缓存策略，让 Vary 头来处理不同 token 的缓存区分
    // 如果用户明确指定了 cache，使用用户指定的值
    cache: options.cache || 'default',
  };

  try {
    const res = await fetchWithRetry(url, fetchOptions, retry);
    clear();

    const json: ApiResponse<T> = await res.json();

    // 业务错误处理
    if (json.code !== 0 && json.code !== 200) {
      throw new ApiError(json.code, json.msg, json.data, res.status);
    }

    // 直接返回 data
    return json.data;
  } catch (err: unknown) {
    clear();

    // 超时错误
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(ErrorCode.TIMEOUT, '请求超时', undefined, 408);
    }

    // ApiError 直接抛出
    if (err instanceof ApiError) {
      throw err;
    }

    // 其他错误
    throw new ApiError(
      ErrorCode.SERVER_ERROR,
      err instanceof Error ? err.message : 'Network Error',
      undefined,
      500,
    );
  }
}
