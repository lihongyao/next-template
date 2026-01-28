/**
 * 示例 API 模块
 * 展示如何使用统一 API 封装模块接口
 */
import type { RequestOptions } from '../core/types';
import { api, del, get, post, put } from '../fetch';

/**
 * 用户信息接口
 */
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * 用户列表查询参数
 */
export interface UserListParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

/**
 * 用户列表响应
 */
export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 获取用户列表
 *
 * 可以在客户端或服务端使用，自动识别环境
 *
 * @example
 * ```ts
 * // 客户端组件
 * 'use client';
 * const users = await getUserList({ page: 1, limit: 10 });
 *
 * // 服务端组件
 * import { headers } from 'next/headers';
 * const serverHeaders = await headers();
 * const users = await getUserList({ page: 1, limit: 10 }, { serverHeaders });
 * ```
 */
export async function getUserList(params?: UserListParams, options?: RequestOptions) {
  return get<UserListResponse>('/users', {
    ...options,
    params: params as Record<string, string | number | boolean>,
  });
}

/**
 * 获取用户详情
 */
export async function getUserById(id: number, options?: RequestOptions) {
  return get<User>(`/users/${id}`, options);
}

/**
 * 创建用户
 */
export async function createUser(data: Omit<User, 'id'>, options?: RequestOptions) {
  return post<User>('/users', {
    ...options,
    body: JSON.stringify(data),
  });
}

/**
 * 更新用户
 */
export async function updateUser(
  id: number,
  data: Partial<Omit<User, 'id'>>,
  options?: RequestOptions,
) {
  return put<User>(`/users/${id}`, {
    ...options,
    body: JSON.stringify(data),
  });
}

/**
 * 删除用户
 */
export async function deleteUser(id: number, options?: RequestOptions) {
  return del(`/users/${id}`, options);
}

/**
 * 获取用户资料（需要登录）
 */
export async function getUserProfile(options?: RequestOptions) {
  return get<User>('/user/profile', {
    ...options,
    isLogin: true,
  });
}
