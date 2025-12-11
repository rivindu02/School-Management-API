import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters'),
  role: z.enum(['user', 'admin']).optional().default('user')
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
