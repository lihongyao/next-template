/**
 * Token 刷新管理
 */
import { REFRESH_TOKEN_PATH, getBaseURL } from './config';
import { clearClientToken, getClientToken, setClientToken } from './token';
import type { TokenData } from './types';
import { ApiError, ErrorCode } from './types';

// 全局刷新控制（防止并发刷新）
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<string> {
  const currentToken = await getClientToken();

  if (!currentToken?.refreshToken) {
    await clearClientToken();
    throw new ApiError(ErrorCode.UNAUTHORIZED, 'No refresh token available');
  }

  try {
    const res = await fetch(`${getBaseURL()}${REFRESH_TOKEN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentToken.refreshToken }),
    });

    const json = await res.json();

    // 检查响应格式
    if (json.code !== 0 && json.code !== 200) {
      await clearClientToken();
      throw new ApiError(json.code, json.msg || '刷新 token 失败');
    }

    const tokenData: TokenData = json.data;
    await setClientToken(tokenData);
    return tokenData.token;
  } catch (error) {
    await clearClientToken();
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(ErrorCode.UNAUTHORIZED, '刷新 token 失败', undefined, 500);
  }
}

/**
 * 获取刷新后的 Token（带并发控制）
 */
export async function getRefreshedToken(): Promise<string> {
  // 如果正在刷新，等待刷新完成
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // 开始刷新
  isRefreshing = true;
  refreshPromise = refreshToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}
