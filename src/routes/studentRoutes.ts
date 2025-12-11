import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema, enrollSchema } from '../schemas/studentSchema';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public GET routes (no authentication required)
router.get('/', studentController.getAll);
router.get('/:id', studentController.getOne);

// Only admins can create students
router.post('/', authenticate, authorize('admin'), validate(createStudentSchema), studentController.create);

// Logged in users and admins can update students
router.put('/:id', authenticate, validate(updateStudentSchema), studentController.update);

// Logged in users and admins can enroll/remove courses for students
router.put('/:id/enroll-course', authenticate, validate(enrollSchema), studentController.enrollCourse);
router.put('/:id/remove-course', authenticate, validate(enrollSchema), studentController.removeCourse);

// Only admins can delete students
router.delete('/:id', authenticate, authorize('admin'), studentController.remove);

export default router;