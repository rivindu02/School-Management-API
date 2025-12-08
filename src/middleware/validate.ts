import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodIssue } from 'zod';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // 1. Check if it's a ZodError
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation Error',
          // 2. Explicitly map using the ZodIssue type
          errors: error.errors.map((e: ZodIssue) => ({
            field: e.path[0],
            message: e.message
          }))
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };