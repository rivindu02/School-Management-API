import { Request, Response, NextFunction } from 'express';
import { z , ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation Error',
          errors: error.errors.map((e) => ({
            field: e.path[0],
            message: e.message
          }))
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };