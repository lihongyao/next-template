/**
 * 底层请求封装
 *
 * 后端约定：只要请求到了后端，HTTP 状态码均为成功（如 200），用 body 里的 code 区分成功/失败；
 * 成功（code 为 0）时只返回 data，失败则抛 ApiError(code, message)；401 需要登录，402 token 过期。
 * HTTP 非 2xx 仅表示未到后端（网络/网关等），此时按 HTTP 状态抛错。
 * 支持超时（与 AbortSignal 合并）、仅对网络类错误重试（指数退避）。
 */
import { DEFAULT_CONFIG, DEV_CONFIG, RETRY_CONFIG } from './config';
import type { BaseResponse } from './types';
import { ApiError, ErrorCode } from './types';

/** 后端约定：code 为 0 表示成功 */
const SUCCESS_CODES = [0];

function createTimeoutController(
  timeout: number,
  signal?: AbortSignal,
): { controller: AbortController; clear: () => void } {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), timeout);
  if (signal?.aborted) c.abort();
  else
    signal?.addEventListener('abort', () => {
      c.abort();
      clearTimeout(id);
    });
  return { controller: c, clear: () => clearTimeout(id) };
}

function isRetryable(err: unknown): boolean {
  if (err instanceof ApiError) return false;
  if (err instanceof Error) {
    return (
      ['TypeError', 'NetworkError', 'AbortError'].includes(err.name) ||
      err.message.includes('fetch')
    );
  }
  return false;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number,
): Promise<Response> {
  let last: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetch(url, options);
    } catch (e) {
      last = e;
      if (!isRetryable(e) || i === retries) throw e;
      const delay = Math.min(
        RETRY_CONFIG.initialDelay * RETRY_CONFIG.backoffMultiplier ** i,
        RETRY_CONFIG.maxDelay,
      );
      await new Promise((r) => setTimeout(r, delay));
      if (options.signal?.aborted) throw e;
    }
  }
  throw last;
}

function parseMessage(json: Record<string, unknown>): string {
  return (json.message as string) ?? (json.msg as string) ?? '请求失败';
}

/**
 * 底层 fetch：带超时、重试，按 BaseResponse 解析，成功返回 data，失败抛 ApiError
 */
export async function baseFetch<T>(
  url: string,
  options: RequestInit = {},
  retry: number = DEFAULT_CONFIG.retry,
  timeout: number = DEFAULT_CONFIG.timeout,
): Promise<T> {
  const existing = options.signal ?? undefined;
  const { controller, clear } = createTimeoutController(timeout, existing);
  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    cache: options.cache ?? 'default',
  };

  if (DEV_CONFIG.enableRequestLog) {
    console.log(`[API] ${options.method ?? 'GET'} ${url}`);
  }

  try {
    const res = await fetchWithRetry(url, fetchOptions, retry);
    clear();

    const text = await res.text();
    let json: BaseResponse<T> | null = null;
    try {
      json = text ? (JSON.parse(text) as BaseResponse<T>) : null;
    } catch {
      // 非 JSON（如网关 502 返回 HTML）时按 HTTP 状态处理
    }

    // 能解析出 body 且带 code：以 code 为准（后端约定 HTTP 200 + 自定义 code）
    if (json && typeof json === 'object' && 'code' in json) {
      if (SUCCESS_CODES.includes(json.code)) {
        return json.data;
      }
      throw new ApiError(
        json.code,
        parseMessage(json as unknown as Record<string, unknown>),
        json.data,
        res.status,
      );
    }

    // 无法按 body.code 判断时（未到后端、网关错误等）：按 HTTP 状态处理
    if (!res.ok) {
      let msg = res.statusText;
      if (json && typeof json === 'object') msg = parseMessage(json as Record<string, unknown>);
      else if (text && !text.startsWith('<!')) msg = text;
      throw new ApiError(
        res.status >= 500 ? ErrorCode.SERVER_ERROR : ErrorCode.UNAUTHORIZED,
        msg,
        json ?? text,
        res.status,
      );
    }

    throw new ApiError(ErrorCode.SERVER_ERROR, '响应格式异常', json ?? text, res.status);
  } catch (e: unknown) {
    clear();
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(ErrorCode.TIMEOUT, '请求超时', undefined, 408);
    }
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      ErrorCode.SERVER_ERROR,
      e instanceof Error ? e.message : 'Network Error',
      undefined,
      500,
    );
  }
}
