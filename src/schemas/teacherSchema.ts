import { z } from 'zod';

export const createTeacherSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2),
  email: z.string({ required_error: "Email is required" }).email()
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const enrollSchema = z.object({
  courseId: z.string({ required_error: "Course ID is required" })
});