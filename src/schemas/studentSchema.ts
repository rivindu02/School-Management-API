import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
  email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
  age: z.number({ required_error: "Age is required" }).positive().max(120),
});

export const updateStudentSchema = createStudentSchema.partial();

// Schema for enrollment/removal actions
export const enrollSchema = z.object({
  courseId: z.string()
});