import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1, "Title must not be empty"),
  code: z.string({ required_error: "Code is required" }).min(2, "Code must not be empty"),
  credits: z.number({ required_error: "Credits is required" }).min(1, "Credits must be at least 1")
});

export const updateCourseSchema = createCourseSchema.partial();