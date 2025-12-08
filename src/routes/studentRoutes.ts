import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema, enrollSchema } from '../schemas/studentSchema';

const router = Router();

router.post('/', validate(createStudentSchema), studentController.create);
router.get('/', studentController.getAll);
router.get('/:id', studentController.getOne);
router.put('/:id', validate(updateStudentSchema), studentController.update);

// Enrollment specific validation
router.put('/:id/enroll-course', validate(enrollSchema), studentController.enrollCourse);
router.put('/:id/remove-course', validate(enrollSchema), studentController.removeCourse);

router.delete('/:id', studentController.remove);

export default router;