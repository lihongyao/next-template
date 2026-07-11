import cookieHelper from '@/libs/cookie-helper';

import {
  ApiError,
  type ApiRequestOptions,
  DEFAULT_CONFIG,
  ErrorCode,
  REFRESH_TOKEN_PATH,
  TOKEN_STORAGE_KEY,
  type TokenData,
  baseFetch,
  getClientBaseURL,
  normalizeAuthMode,
} from './core';
import { createApiMethodHelpers } from './methods';
import { parseToken, serializeToken } from './token';

const CLIENT_TOKEN_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

/** 读取过渡期使用的客户端可读鉴权 Cookie。 */
export async function getClientToken(): Promise<TokenData | null> {
  if (typeof window === 'undefined') return null;
  return parseToken(await cookieHelper.get(TOKEN_STORAGE_KEY));
}

/**
 * 过渡期使用的客户端 token 写入方法。
 *
 * 生产鉴权优先使用 Route Handler 或 Server Function 调用 ‘setServerToken()’，
 * 让 token 存在 HttpOnly Cookie 中。
 */
export async function setClientToken(data: TokenData): Promise<void> {
  if (typeof window === 'undefined') return;
  await cookieHelper.set(TOKEN_STORAGE_KEY, serializeToken(data), {
    ...CLIENT_TOKEN_COOKIE_OPTIONS,
    expires: 30,
  });
}

/** 清理过渡期使用的客户端可读鉴权 Cookie。 */
export async function clearClientToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  await cookieHelper.delete(TOKEN_STORAGE_KEY, { path: '/' });
}

/** 刷新一次客户端鉴权，并持久化后端返回的 token 数据。 */
export async function refreshToken(): Promise<string> {
  const current = await getClientToken();
  if (!current?.refreshToken) {
    await clearClientToken();
    throw new ApiError(ErrorCode.UNAUTHORIZED, '缺少 refresh token');
  }

  try {
    const data = await baseFetch<TokenData>(REFRESH_TOKEN_PATH, {
      baseURL: getClientBaseURL(),
      body: { refreshToken: current.refreshToken },
      cache: 'no-store',
      method: 'POST',
      privateRequest: true,
      timeout: DEFAULT_CONFIG.clientTimeout,
    });
    await setClientToken(data);
    return data.token;
  } catch (error) {
    await clearClientToken();
    throw error;
  }
}

let refreshing: Promise<string> | null = null;

/** ‘clientApi()’ 使用的单飞 token 刷新辅助函数。 */
export async function getRefreshedToken(): Promise<string> {
  if (refreshing) return refreshing;
  refreshing = refreshToken().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function clientApiWithRefresh<T = unknown>(
  input: string,
  options: ApiRequestOptions = {},
  refreshTried = false,
  refreshedAccessToken?: string,
): Promise<T> {
  if (typeof window === 'undefined') {
    throw new Error('clientApi 只能在客户端运行时使用。');
  }

  const authMode = normalizeAuthMode(options);
  const tokenData = authMode === 'none' ? null : await getClientToken();
  const accessToken = refreshedAccessToken ?? tokenData?.token;

  if (authMode === 'required' && !accessToken) {
    throw new ApiError(ErrorCode.LOGIN_REQUIRED, '请登录');
  }

  try {
    return await baseFetch<T>(input, {
      ...options,
      accessToken,
      baseURL: options.baseURL ?? getClientBaseURL(),
      privateRequest: Boolean(accessToken) || authMode === 'required',
      timeout: options.timeout ?? DEFAULT_CONFIG.clientTimeout,
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.code === ErrorCode.TOKEN_EXPIRED &&
      authMode !== 'none' &&
      !refreshTried
    ) {
      const nextToken = await getRefreshedToken();
      return clientApiWithRefresh<T>(input, options, true, nextToken);
    }
    throw error;
  }
}

/**
 * 客户端请求入口。
 *
 * 适合交互触发的数据或纯客户端流程。首屏数据如果有利于 SSR 或流式渲染，
 * 仍然可以使用 ‘serverApi()’。
 */
export async function clientApi<T = unknown>(
  input: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return clientApiWithRefresh<T>(input, options);
}

const clientMethodHelpers = createApiMethodHelpers(clientApi);

export const clientGet = clientMethodHelpers.get;
export const clientPost = clientMethodHelpers.post;
export const clientPut = clientMethodHelpers.put;
export const clientPatch = clientMethodHelpers.patch;
export const clientDel = clientMethodHelpers.del;
