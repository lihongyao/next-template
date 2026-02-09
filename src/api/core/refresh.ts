/**
 * Token 刷新
 *
 * 仅客户端使用（api 层在 TOKEN_EXPIRED 时调用）；单飞防并发，解析 BaseResponse 后写回 Cookie 并返回新 token。
 */
import { REFRESH_TOKEN_PATH, getBaseURL } from './config';
import { clearClientToken, getClientToken, setClientToken } from './token';
import type { BaseResponse, TokenData } from './types';
import { ApiError, ErrorCode } from './types';

/** 后端约定：code 为 0 表示成功 */
const SUCCESS_CODES = [0];

/** 调用刷新接口，失败时清空本地 token 并抛错 */
export async function refreshToken(): Promise<string> {
  const current = await getClientToken();
  if (!current?.refreshToken) {
    await clearClientToken();
    throw new ApiError(ErrorCode.UNAUTHORIZED, 'No refresh token');
  }
  const url = `${getBaseURL()}${REFRESH_TOKEN_PATH}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  const json = (await res.json()) as BaseResponse<TokenData>;
  const message = json.message ?? (json as unknown as { msg?: string }).msg ?? '刷新失败';
  if (!SUCCESS_CODES.includes(json.code)) {
    await clearClientToken();
    throw new ApiError(json.code, message, json.data, res.status);
  }
  await setClientToken(json.data);
  return json.data.token;
}

let refreshing: Promise<string> | null = null;

/** 带单飞的刷新：并发多次调用只发一次请求，共享同一结果 */
export async function getRefreshedToken(): Promise<string> {
  if (refreshing) return refreshing;
  refreshing = refreshToken().finally(() => {
    refreshing = null;
  });
  return refreshing;
}
