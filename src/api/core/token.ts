/**
 * Token 管理
 *
 * 后端不在响应里 Set-Cookie，只在 data 里返回 token；由前端自己存、自己清。
 * - 登录成功：拿到接口返回的 data（含 token/refreshToken），在客户端调用 setClientToken(data) 写入 Cookie。
 * - 退出登录：在客户端调用 clearClientToken() 删除 Cookie 即可；服务端不参与清理，Cookie 在浏览器里，客户端清掉后下次请求就不会带 token。
 * - 服务端：只从请求里读 Cookie（next/headers cookies()），不写、不删；读到的就是当前请求带过来的值，与客户端是否刚清掉 Cookie 一致。
 */
import cookieHelper from '@/libs/cookie-helper';

import { TOKEN_STORAGE_KEY } from './config';
import type { TokenData } from './types';

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  expires: 30,
};

/** 客户端：从 Cookie 读取 token，仅在浏览器环境有效 */
export async function getClientToken(): Promise<TokenData | null> {
  if (typeof window === 'undefined') return null;
  try {
    const raw = await cookieHelper.get(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenData) : null;
  } catch {
    return null;
  }
}

/** 客户端：将 token 写入 Cookie（登录 / 刷新成功后调用） */
export async function setClientToken(data: TokenData): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await cookieHelper.set(TOKEN_STORAGE_KEY, JSON.stringify(data), {
      ...COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (e) {
    console.warn('[Token] set cookie failed', e);
  }
}

/** 客户端：清除 Cookie 中的 token（登出时调用） */
export async function clearClientToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await cookieHelper.delete(TOKEN_STORAGE_KEY, { path: '/' });
  } catch (e) {
    console.warn('[Token] clear cookie failed', e);
  }
}

/**
 * 自动环境：客户端从 Cookie 读，服务端从 next/headers cookies() 读
 *
 * 服务端使用动态 import('next/headers')，仅在该分支执行，不会混入客户端 bundle。
 */
export async function getToken(): Promise<TokenData | null> {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const raw = cookieStore.get(TOKEN_STORAGE_KEY)?.value;
    return raw ? (JSON.parse(decodeURIComponent(raw)) as TokenData) : null;
  }
  return getClientToken();
}
