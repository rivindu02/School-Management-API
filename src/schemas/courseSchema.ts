import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string({ required_error: "Title is required" }),
  code: z.string({ required_error: "Course Code is required" }),
  credits: z.number({ required_error: "Credits are required" }).min(1, "Credits must be at least 1")
});

export const updateCourseSchema = createCourseSchema.partial();