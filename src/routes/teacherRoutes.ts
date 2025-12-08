import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { validate } from '../middleware/validate';
import { createTeacherSchema, updateTeacherSchema, enrollSchema } from '../schemas/teacherSchema';

const router = Router();

router.post('/', validate(createTeacherSchema), teacherController.create);
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getOne);
router.put('/:id', validate(updateTeacherSchema), teacherController.update);

// Enrollment specific validation
router.put('/:id/enroll-course', validate(enrollSchema), teacherController.enrollCourse);
router.put('/:id/remove-course', validate(enrollSchema), teacherController.removeCourse);

router.delete('/:id', teacherController.remove);

export default router;