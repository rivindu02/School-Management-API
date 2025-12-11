import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string("Name must be a string"),
  email: z.string().email("Invalid email address"),
  age: z.number().positive().max(120),
});

export const updateStudentSchema = createStudentSchema.partial();

// Schema for enrollment/removal actions
export const enrollSchema = z.object({
  courseId: z.string()
});