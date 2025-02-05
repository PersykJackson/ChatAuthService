import { z } from 'zod';
import { config } from '@src/config';

export const User = z.object({
  email: z.string().email(),
  name: z.string().min(config.USER_NAME_MINIMAL_LENGTH),
  password: z.string().length(config.PASSWORD_LENGTH),
});

export const Auth = z.object({
  authToken: z.string().jwt(),
  refreshToken: z.string().jwt(),
});

export type User = z.infer<typeof User>;
export type Auth = z.infer<typeof Auth>;
