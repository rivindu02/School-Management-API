import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { validate } from '../middleware/validate';
import { createTeacherSchema, updateTeacherSchema, enrollSchema } from '../schemas/teacherSchema';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public GET routes (no authentication required)
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getOne);

// Only admins can create teachers
router.post('/', authenticate, authorize('admin'), validate(createTeacherSchema), teacherController.create);

// Authenticated users and admins can update teachers
router.put('/:id', authenticate, validate(updateTeacherSchema), teacherController.update);

// Logged in users and admins can enroll/remove courses for teachers
router.put('/:id/enroll-course', authenticate, validate(enrollSchema), teacherController.enrollCourse);
router.put('/:id/remove-course', authenticate, validate(enrollSchema), teacherController.removeCourse);

// Only admins can delete teachers
router.delete('/:id', authenticate, authorize('admin'), teacherController.remove);

export default router;