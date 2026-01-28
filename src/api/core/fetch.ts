/**
 * 基础 Fetch 封装
 * 2026 最佳实践：完善的错误处理、重试机制、超时控制
 */
import { DEV_CONFIG, RETRY_CONFIG } from './config';
import type { ApiResponse } from './types';
import { ApiError, ErrorCode } from './types';

/**
 * 创建超时控制器
 * 支持自定义超时时间和 AbortSignal 合并
 */
function createTimeoutController(
  timeout: number,
  existingSignal?: AbortSignal,
): { controller: AbortController; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // 如果已有 signal，监听其取消事件
  if (existingSignal) {
    if (existingSignal.aborted) {
      controller.abort();
    } else {
      existingSignal.addEventListener('abort', () => {
        controller.abort();
        clearTimeout(id);
      });
    }
  }

  return {
    controller,
    clear: () => {
      clearTimeout(id);
    },
  };
}

/**
 * 判断是否为可重试的错误
 * 只有网络错误才重试，业务错误不重试
 */
function isRetryableError(err: unknown): boolean {
  if (err instanceof ApiError) {
    // 业务错误不重试
    return false;
  }

  if (err instanceof Error) {
    // 网络错误、超时错误可以重试
    return (
      err.name === 'TypeError' ||
      err.name === 'NetworkError' ||
      err.name === 'AbortError' ||
      err.message.includes('fetch')
    );
  }

  return false;
}

/**
 * 带重试的 fetch（指数退避）
 * 只在网络错误时重试，业务错误不重试
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number,
): Promise<Response> {
  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);

      // HTTP 错误状态码（4xx, 5xx）不重试，直接返回
      // 让上层处理业务错误
      return res;
    } catch (err) {
      lastError = err;

      // 如果不可重试或已达到最大重试次数，直接抛出
      if (!isRetryableError(err) || i === retries) {
        throw err;
      }

      // 指数退避：使用配置的初始延迟和倍数
      const delay = Math.min(
        RETRY_CONFIG.initialDelay * RETRY_CONFIG.backoffMultiplier ** i,
        RETRY_CONFIG.maxDelay,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));

      // 如果请求已被取消，不再重试
      if (options.signal?.aborted) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * 开发环境日志记录
 */
function logRequest(url: string, options: RequestInit, response?: Response, error?: unknown) {
  if (!DEV_CONFIG.enableRequestLog) {
    return;
  }

  const method = options.method || 'GET';
  const timestamp = new Date().toISOString();

  if (error) {
    console.group(`🚫 [API] ${method} ${url} - Error`);
    console.error('Time:', timestamp);
    console.error('Error:', error);
    console.groupEnd();
  } else if (response) {
    const status = response.status;
    const statusEmoji = status >= 200 && status < 300 ? '✅' : '⚠️';
    console.group(`${statusEmoji} [API] ${method} ${url} - ${status}`);
    console.log('Time:', timestamp);
    if (options.body) {
      try {
        console.log('Request Body:', JSON.parse(options.body as string));
      } catch {
        console.log('Request Body:', options.body);
      }
    }
    console.groupEnd();
  } else {
    console.log(`📤 [API] ${method} ${url}`, timestamp);
  }
}

/**
 * 基础 Fetch 封装
 *
 * @param url 请求 URL
 * @param options 请求配置
 * @param retry 重试次数
 * @param timeout 超时时间（毫秒）
 * @returns 响应数据（直接返回 data）
 */
export async function baseFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retry = 0,
  timeout = 60000,
): Promise<T> {
  // 合并 AbortSignal（支持外部取消）
  const existingSignal = options.signal;
  const { controller, clear } = createTimeoutController(timeout, existingSignal);

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

  // 开发环境记录请求日志
  logRequest(url, fetchOptions);

  try {
    const res = await fetchWithRetry(url, fetchOptions, retry);
    clear();

    // 开发环境记录响应日志
    logRequest(url, fetchOptions, res);

    // 处理 HTTP 错误状态码
    if (!res.ok) {
      const text = await res.text();
      let errorBody: unknown = text;
      let message = res.statusText;

      try {
        errorBody = JSON.parse(text);
        if (typeof errorBody === 'object' && errorBody !== null) {
          const body = errorBody as Record<string, unknown>;
          message = (body.msg as string) || (body.message as string) || message;
        }
      } catch {
        // 如果不是 JSON，使用原始文本
        if (text && !text.startsWith('<!DOCTYPE')) {
          message = text;
        }
      }

      throw new ApiError(
        res.status >= 500 ? ErrorCode.SERVER_ERROR : ErrorCode.UNAUTHORIZED,
        message || `HTTP ${res.status}`,
        errorBody,
        res.status,
      );
    }

    // 解析 JSON 响应
    let json: ApiResponse<T>;
    try {
      json = await res.json();
    } catch (parseError) {
      throw new ApiError(
        ErrorCode.SERVER_ERROR,
        '响应格式错误：无法解析 JSON',
        undefined,
        res.status,
      );
    }

    // 业务错误处理
    if (json.code !== 0 && json.code !== 200) {
      throw new ApiError(json.code, json.msg || '请求失败', json.data, res.status);
    }

    // 直接返回 data
    return json.data;
  } catch (err: unknown) {
    clear();

    // 开发环境记录错误日志
    logRequest(url, fetchOptions, undefined, err);

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
