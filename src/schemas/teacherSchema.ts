import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
  email: z.string({ required_error: "Email is required" }).email("Enter a valid email address"),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const enrollSchema = z.object({
  courseId: z.string()
});