import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const enrollSchema = z.object({
  courseId: z.string()
});