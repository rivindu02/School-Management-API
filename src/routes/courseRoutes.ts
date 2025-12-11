import { Router } from 'express';
import * as courseController from '../controllers/courseController';
import { validate } from '../middleware/validate';
import { createCourseSchema, updateCourseSchema } from '../schemas/courseSchema';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public GET routes (no authentication required)
router.get('/', courseController.getAll);
router.get('/:id', courseController.getOne);

// Only admins can create courses
router.post('/', authenticate, authorize('admin'), validate(createCourseSchema), courseController.create);

// Logged in users and admins can update courses
router.put('/:id', authenticate, authorize('user', 'admin'), validate(updateCourseSchema), courseController.update);

// Only admins can delete courses
router.delete('/:id', authenticate, authorize('admin'), courseController.remove);

export default router;