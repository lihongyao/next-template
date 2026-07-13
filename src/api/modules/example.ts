/**
 * API 模块示例。
 */
import type { ApiRequestOptions } from '../core';
import { del, get, post, put } from '../fetch';

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
 * 默认是公开请求。列表适合被 Next Data Cache 缓存时，可以传入
 * cache 或 next。
 */
export async function getUserList(params?: UserListParams, options?: ApiRequestOptions) {
  return get<UserListResponse>('/users', {
    ...options,
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * 获取用户详情
 */
export async function getUserById(id: number, options?: ApiRequestOptions) {
  return get<User>(`/users/${id}`, options);
}

/**
 * 创建用户
 */
export async function createUser(data: Omit<User, 'id'>, options?: ApiRequestOptions) {
  return post<User>('/users', {
    ...options,
    body: data,
  });
}

/**
 * 更新用户
 */
export async function updateUser(
  id: number,
  data: Partial<Omit<User, 'id'>>,
  options?: ApiRequestOptions,
) {
  return put<User>(`/users/${id}`, {
    ...options,
    body: data,
  });
}

/**
 * 删除用户
 */
export async function deleteUser(id: number, options?: ApiRequestOptions) {
  return del(`/users/${id}`, options);
}

/**
 * 获取用户资料（需要登录）
 */
export async function getUserProfile(options?: ApiRequestOptions) {
  return get<User>('/user/profile', {
    ...options,
    auth: 'required',
  });
}
