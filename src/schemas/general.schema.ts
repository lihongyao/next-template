/**
 *
 * pnpm add zod react-hook-form @hookform/resolvers
 */
import { z } from 'zod';

/**
 * 用户名
 * - 长度 4-20
 * - 只能包含字母、数字和下划线
 */
export const z_username = z
  .string()
  .min(4, { message: 'Username must be at least 4 characters' })
  .max(20, {
    message: 'Username must be at most 20 characters',
  })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  });

/**
 * 密码
 * - 长度 6-
 */
export const z_password = z.string().min(6, { message: 'Password must be at least 6 characters' });

/**
 * 手机号
 */
export const z_phone = z.string().regex(/^1[3-9]\d{9}$/, { message: 'Invalid phone number' });

/**
 * 邮箱（可选，可为空）
 */
export const z_email = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .pipe(z.email({ message: 'Invalid email' }).optional());
