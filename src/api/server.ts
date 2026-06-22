import {
  ApiError,
  type ApiRequestOptions,
  DEFAULT_CONFIG,
  ErrorCode,
  TOKEN_STORAGE_KEY,
  type TokenData,
  baseFetch,
  getServerBaseURL,
  normalizeAuthMode,
} from './core';

const SERVER_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;
const SERVER_TOKEN_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

function serializeToken(data: TokenData): string {
  return encodeURIComponent(JSON.stringify(data));
}

function parseToken(raw?: string | null): TokenData | null {
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

/** 从当前请求 Cookie 中读取鉴权 token 数据。 */
export async function getServerToken(): Promise<TokenData | null> {
  if (typeof window !== 'undefined') return null;
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return parseToken(cookieStore.get(TOKEN_STORAGE_KEY)?.value);
}

/** 在 Route Handler 或 Server Function 中写入鉴权 Cookie。 */
export async function setServerToken(data: TokenData): Promise<void> {
  if (typeof window !== 'undefined') return;
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_STORAGE_KEY, serializeToken(data), {
    ...SERVER_TOKEN_COOKIE_OPTIONS,
    httpOnly: true,
    maxAge: SERVER_TOKEN_MAX_AGE,
  });
}

/** 在 Route Handler 或 Server Function 中清理鉴权 Cookie。 */
export async function clearServerToken(): Promise<void> {
  if (typeof window !== 'undefined') return;
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_STORAGE_KEY);
}

/**
 * 服务端请求入口。
 *
 * 公开请求默认不会读取 Cookie，并且可以参与 Next fetch 缓存。私有请求会强制
 * 使用 ‘cache: 'no-store'’。
 */
export async function serverApi<T = unknown>(
  input: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const authMode = normalizeAuthMode(options);
  const tokenData = authMode === 'none' ? null : await getServerToken();
  const accessToken = tokenData?.token;

  if (authMode === 'required' && !accessToken) {
    throw new ApiError(ErrorCode.LOGIN_REQUIRED, '请登录');
  }

  return baseFetch<T>(input, {
    ...options,
    accessToken,
    baseURL: options.baseURL ?? getServerBaseURL(),
    privateRequest: Boolean(accessToken) || authMode === 'required',
    timeout: options.timeout ?? DEFAULT_CONFIG.serverTimeout,
  });
}

export function serverGet<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>,
): Promise<T> {
  return serverApi<T>(input, { ...options, method: 'GET' });
}

export function serverPost<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return serverApi<T>(input, { ...options, method: 'POST' });
}

export function serverPut<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return serverApi<T>(input, { ...options, method: 'PUT' });
}

export function serverPatch<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method'>,
): Promise<T> {
  return serverApi<T>(input, { ...options, method: 'PATCH' });
}

export function serverDel<T = unknown>(
  input: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>,
): Promise<T> {
  return serverApi<T>(input, { ...options, method: 'DELETE' });
}
