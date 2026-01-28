/**
 * Token 管理
 * 统一使用 Cookie 存储，客户端和服务端都能读取
 */
import cookieHelper from '@/libs/cookie-helper';

import { TOKEN_STORAGE_KEY } from './config';
import type { TokenData } from './types';

/**
 * 获取 Token（客户端）
 * 从 Cookie 读取
 */
export async function getClientToken(): Promise<TokenData | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const tokenStr = await cookieHelper.get(TOKEN_STORAGE_KEY);
    if (!tokenStr) return null;
    return JSON.parse(tokenStr) as TokenData;
  } catch {
    return null;
  }
}

/**
 * 设置 Token（客户端）
 * 存储到 Cookie
 */
export async function setClientToken(tokenData: TokenData): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 将 token 数据序列化为 JSON 字符串
    const tokenStr = JSON.stringify(tokenData);

    // 设置 cookie（30 天过期，可根据需要调整）
    await cookieHelper.set(TOKEN_STORAGE_KEY, tokenStr, {
      expires: 30, // 30 天
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', // 生产环境使用 secure
    });
  } catch (error) {
    console.warn('[Token] Failed to save token to cookie:', error);
  }
}

/**
 * 清除 Token（客户端）
 * 删除 Cookie
 */
export async function clearClientToken(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await cookieHelper.delete(TOKEN_STORAGE_KEY, {
      path: '/',
    });
  } catch (error) {
    console.warn('[Token] Failed to clear token from cookie:', error);
  }
}

/**
 * 获取 Token（服务端）
 * 从请求头中的 cookie 读取
 */
export function getServerToken(serverHeaders?: Headers): TokenData | null {
  if (!serverHeaders) {
    return null;
  }

  try {
    const cookie = serverHeaders.get('cookie') || '';
    const match = cookie.match(new RegExp(`${TOKEN_STORAGE_KEY}=([^;]+)`));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match[1])) as TokenData;
  } catch {
    return null;
  }
}

/**
 * 获取 Token（自动识别环境）
 * 客户端从 Cookie 读取，服务端从 headers 读取
 */
export async function getToken(serverHeaders?: Headers): Promise<TokenData | null> {
  if (typeof window !== 'undefined') {
    return await getClientToken();
  }
  return getServerToken(serverHeaders);
}

/**
 * 获取 Token 字符串（自动识别环境）
 */
export async function getTokenString(serverHeaders?: Headers): Promise<string | null> {
  const tokenData = await getToken(serverHeaders);
  return tokenData?.token || null;
}
