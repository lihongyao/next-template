/**
 *
 * pnpm add zod react-hook-form @hookform/resolvers
 */
import { z } from 'zod';

import { z_email, z_password, z_username } from './general.schema';

export const registerSchema = z.object({
  username: z_username,
  password: z_password,
  email: z_email,
});

export const loginSchema = z.object({
  username: z_username,
  password: z_password,
});

export type RegisterFormValues = z.input<typeof registerSchema>;
export type RegisterSubmitValues = z.output<typeof registerSchema>;

export type LoginFormValues = z.input<typeof loginSchema>;
export type LoginSubmitValues = z.output<typeof loginSchema>;
