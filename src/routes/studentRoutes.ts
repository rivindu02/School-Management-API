import { Router } from 'express';
import * as studentController from '../controllers/studentController';

const router = Router();

router.post('/', studentController.create);
router.get('/', studentController.getAll);
router.get('/:id', studentController.getOne);
router.put('/:id', studentController.update);
router.put('/:id/enroll-course', studentController.enrollCourse);
router.put('/:id/remove-course', studentController.removeCourse);
router.delete('/:id', studentController.remove);

export default router;