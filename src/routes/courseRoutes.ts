import { Router } from 'express';
import * as courseController from '../controllers/courseController';
import { validate } from '../middleware/validate';
import { createCourseSchema, updateCourseSchema } from '../schemas/courseSchema';

const router = Router();

router.post('/', validate(createCourseSchema), courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getOne);
router.put('/:id', validate(updateCourseSchema), courseController.update);
router.delete('/:id', courseController.remove);

export default router;