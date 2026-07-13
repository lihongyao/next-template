/**
 * API 请求层的共享基础能力。
 *
 * 只放运行时无关的代码：协议类型、token 编解码、请求参数处理、响应解析、重试和超时。
 * 客户端 token 刷新在 client.ts；HttpOnly Cookie 访问在 server.ts。
 */

export interface BaseResponse<T = unknown> {
  /** 后端业务码，0 表示成功。 */
  code: number;
  /** 成功数据或后端返回的错误数据。 */
  data: T;
}

/** 登录或刷新接口返回的 token 数据。 */
export interface TokenData {
  token: string;
  refreshToken: string;
}

export function serializeToken(data: TokenData): string {
  return encodeURIComponent(JSON.stringify(data));
}

export function parseToken(raw?: string | null): TokenData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenData;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw)) as TokenData;
    } catch {
      return null;
    }
  }
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = string | Record<string, QueryValue>;

/**
 * 请求鉴权行为。
 *
 * - none: 公开请求，不读取鉴权 Cookie。
 * - optional: 有 token 就携带，没有也继续请求。
 * - required: 没有 token 时，请求前抛出 LOGIN_REQUIRED。
 */
export type ApiAuthMode = 'none' | 'optional' | 'required';
export type ApiResponseMode = 'base-response' | 'json' | 'text' | 'response';
export type ApiNextOptions = NonNullable<RequestInit['next']>;
export type ApiBody = BodyInit | Record<string, unknown> | undefined;

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  /** URL 查询参数。字符串会原样拼接；对象会通过 URLSearchParams 编码。 */
  params?: QueryParams;
  /** 请求体。普通对象会序列化为 JSON；FormData 等 BodyInit 会原样透传。 */
  body?: ApiBody;
  /** 请求头。传 JSON 对象 body 且未显式设置 Content-Type 时，会自动补 application/json。 */
  headers?: HeadersInit;
  /** 默认是 none。 */
  auth?: ApiAuthMode;
  /** 覆盖当前运行时的基础 URL。 */
  baseURL?: string;
  /** 毫秒。传 false 时不创建 AbortSignal。 */
  timeout?: number | false;
  /** 网络重试次数。默认只有幂等方法会重试。 */
  retry?: number;
  /** 明确需要时，允许非幂等方法重试。 */
  retryUnsafe?: boolean;
  /** 客户端请求失败时是否派发全局错误事件。默认 true。 */
  errorToast?: boolean;
  /** 原生 Next fetch 配置，如 next.revalidate 和 next.tags。 */
  next?: ApiNextOptions;
  /** 响应解析模式。默认按后端 BaseResponse 包装解析。 */
  responseMode?: ApiResponseMode;
}

interface InternalRequestOptions extends ApiRequestOptions {
  accessToken?: string;
  privateRequest?: boolean;
}

export const ErrorCode = {
  SUCCESS: 0,
  LOGIN_REQUIRED: 401,
  UNAUTHORIZED: 401,
  TOKEN_EXPIRED: 402,
  TIMEOUT: 408,
  SERVER_ERROR: 500,
} as const;

/** API 层完成协议解析后抛出的错误。 */
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

export const API_ERROR_EVENT = 'api-error';

export interface ApiErrorEventDetail {
  error: ApiError;
}

export const TOKEN_STORAGE_KEY = 'AUTHORIZATION_TOKEN';
export const REFRESH_TOKEN_PATH = '/v1/token/refresh';

export const DEFAULT_CONFIG = {
  clientTimeout: 60_000,
  serverTimeout: false,
  retry: 0,
} as const;

const RETRY_CONFIG = {
  initialDelay: 300,
  maxDelay: 10_000,
  backoffMultiplier: 2,
} as const;

const ENABLE_REQUEST_LOG = process.env.NODE_ENV === 'development';

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function appendParams(url: string, params?: QueryParams): string {
  if (!params) return url;
  if (typeof params === 'string') return url + (url.includes('?') ? '&' : '?') + params;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }

  const query = search.toString();
  return query ? url + (url.includes('?') ? '&' : '?') + query : url;
}

function joinUrl(baseURL: string | undefined, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseURL) return path;
  return `${baseURL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function isPlainJsonBody(body: ApiBody): body is Record<string, unknown> {
  if (body === undefined || body === null || Array.isArray(body)) return false;
  if (typeof body !== 'object') return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return false;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return false;
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false;
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false;
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body)) return false;
  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) return false;
  return true;
}

function normalizeBody(body: ApiBody, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (isPlainJsonBody(body)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return JSON.stringify(body);
  }
  return body as BodyInit;
}

function assertBodyAllowed(method: string, body: ApiBody): void {
  if ((method === 'GET' || method === 'HEAD') && body !== undefined && body !== null) {
    throw new TypeError(`${method} 请求不支持 body，请使用 params 传查询参数。`);
  }
}

function createTimeoutSignal(
  timeout: number | false | undefined,
  signal?: AbortSignal,
): { signal?: AbortSignal; clear: () => void } {
  if (timeout === false || timeout === undefined) return { signal, clear: () => {} };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  if (signal?.aborted) {
    controller.abort();
    clearTimeout(id);
  } else {
    signal?.addEventListener(
      'abort',
      () => {
        controller.abort();
        clearTimeout(id);
      },
      { once: true },
    );
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) return false;
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'TypeError' ||
    error.name === 'NetworkError' ||
    error.name === 'AbortError' ||
    error.message.toLowerCase().includes('fetch')
  );
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries: number,
  retryUnsafe: boolean,
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const canRetry = retryUnsafe || IDEMPOTENT_METHODS.has(method);
  const maxRetries = canRetry ? retries : 0;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === maxRetries) throw error;
      const delay = Math.min(
        RETRY_CONFIG.initialDelay * RETRY_CONFIG.backoffMultiplier ** attempt,
        RETRY_CONFIG.maxDelay,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      if (init.signal?.aborted) throw error;
    }
  }

  throw lastError;
}

function isSuccessCode(code: number): boolean {
  return code === ErrorCode.SUCCESS;
}

function getHttpErrorCode(status: number): number {
  if (status === ErrorCode.TIMEOUT) return ErrorCode.TIMEOUT;
  if (status >= 500) return ErrorCode.SERVER_ERROR;
  if (status === ErrorCode.UNAUTHORIZED) return ErrorCode.UNAUTHORIZED;
  return status;
}

function tryParseJson(text: string): { parsed: boolean; value: unknown } {
  if (!text) return { parsed: true, value: null };
  try {
    return { parsed: true, value: JSON.parse(text) };
  } catch {
    return { parsed: false, value: null };
  }
}

function isBaseResponsePayload<T>(value: unknown): value is BaseResponse<T> {
  return (
    value !== null &&
    typeof value === 'object' &&
    'code' in value &&
    typeof (value as { code?: unknown }).code === 'number'
  );
}

function createHttpError(
  response: Response,
  text: string,
  json: unknown,
  parsedJson: boolean,
): ApiError {
  const payload = parsedJson && isBaseResponsePayload(json) ? json : null;
  const payloadCode = payload && !isSuccessCode(payload.code) ? payload.code : undefined;
  const data = payload ? payload.data : parsedJson ? json : text;

  return new ApiError(
    payloadCode ?? getHttpErrorCode(response.status),
    response.statusText || '请求失败',
    data,
    response.status,
  );
}

function createResponseFormatError(response: Response, text: string, json: unknown): ApiError {
  return new ApiError(ErrorCode.SERVER_ERROR, '响应格式异常', json ?? text, response.status);
}

async function parseResponse<T>(response: Response, mode: ApiResponseMode | undefined) {
  if (mode === 'response') return response as T;

  const text = await response.text();

  if (mode === 'text') {
    if (!response.ok) {
      throw new ApiError(
        getHttpErrorCode(response.status),
        response.statusText || text || '请求失败',
        text,
        response.status,
      );
    }
    return text as T;
  }

  const { parsed, value: json } = tryParseJson(text);

  if (mode === 'json') {
    if (!response.ok) throw createHttpError(response, text, json, parsed);
    if (response.status === 204) return undefined as T;
    if (!text || !parsed) throw createResponseFormatError(response, text, json);
    return json as T;
  }

  if (!response.ok) throw createHttpError(response, text, json, parsed);
  if (response.status === 204) return undefined as T;
  if (!text || !parsed) throw createResponseFormatError(response, text, json);

  if (isBaseResponsePayload<T>(json)) {
    const payload = json;
    if (isSuccessCode(payload.code)) {
      return payload.data;
    }
    throw new ApiError(payload.code, '请求失败', payload.data, response.status);
  }

  throw createResponseFormatError(response, text, json);
}

/**
 * 底层请求执行器。
 *
 * 业务侧优先使用 serverApi、clientApi 或领域模块。这里只负责构建 fetch 请求并解析响应。
 */
export async function baseFetch<T>(
  input: string,
  options: InternalRequestOptions = {},
): Promise<T> {
  const {
    accessToken,
    auth: _auth,
    baseURL,
    body,
    cache: inputCache,
    errorToast: _errorToast,
    headers: inputHeaders,
    next: inputNext,
    params,
    privateRequest,
    retry = DEFAULT_CONFIG.retry,
    retryUnsafe = false,
    responseMode = 'base-response',
    timeout,
    ...rest
  } = options;

  const method = (rest.method ?? 'GET').toUpperCase();
  const headers = new Headers(inputHeaders);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  assertBodyAllowed(method, body);

  const normalizedBody = normalizeBody(body, headers);
  const cache = privateRequest ? 'no-store' : inputCache;
  const next = cache === 'no-store' ? undefined : inputNext;
  const url = appendParams(joinUrl(baseURL, input), params);
  const { signal, clear } = createTimeoutSignal(timeout, rest.signal ?? undefined);

  const init: RequestInit & { next?: ApiNextOptions } = {
    ...rest,
    body: normalizedBody,
    cache,
    headers,
    method,
    next,
    signal,
  };

  if (ENABLE_REQUEST_LOG) {
    console.log(`[API] ${method} ${url}`);
  }

  try {
    const response = await fetchWithRetry(url, init, retry, retryUnsafe);
    clear();
    return await parseResponse<T>(response, responseMode);
  } catch (error) {
    clear();
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(ErrorCode.TIMEOUT, '请求超时', undefined, 408);
    }
    throw new ApiError(
      ErrorCode.SERVER_ERROR,
      error instanceof Error ? error.message : '网络错误',
      undefined,
      500,
    );
  }
}
