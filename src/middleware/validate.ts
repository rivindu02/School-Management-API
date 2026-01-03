import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';  // Use a validation library like Joi or Zod (cleaner than manual Regex)

export const validate = (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);
    if (result.success) {
      // Assign parsed data so transforms/stripping apply downstream
      req.body = result.data as any;
      return next();
    }

    const issues = result.error.issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
      message: e.message
    }));

    return res.status(400).json({
      message: 'Validation Error',
      errors: issues
    });
  };