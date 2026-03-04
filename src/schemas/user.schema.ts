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

export type RegisterFormValues = z.infer<typeof registerSchema>;
