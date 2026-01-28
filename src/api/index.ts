/**
 * API 统一导出
 *
 * 推荐使用统一的 api 函数，自动识别客户端/服务端环境
 *
 * @example
 * ```ts
 * // 客户端或服务端都可以使用
 * import { api } from '@/api';
 * const user = await api('/users/1');
 *
 * // 服务端组件中，可以传入 headers
 * import { headers } from 'next/headers';
 * const serverHeaders = await headers();
 * const user = await api('/users/1', { serverHeaders });
 * ```
 */

// 统一 API
export { api, get, post, put, patch, del } from './fetch';

// 核心类型和工具
export type { ApiResponse, TokenData, RequestOptions } from './core/types';
export { ApiError, ErrorCode } from './core/types';
export {
  getClientToken,
  setClientToken,
  clearClientToken,
  getToken,
  getTokenString,
} from './core/token';
export { getBaseURL, TOKEN_STORAGE_KEY } from './core/config';
