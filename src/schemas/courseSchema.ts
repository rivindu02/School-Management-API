import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string(),
  code: z.string(),
  credits: z.number().min(1, "Credits must be at least 1")
});

export const updateCourseSchema = createCourseSchema.partial();