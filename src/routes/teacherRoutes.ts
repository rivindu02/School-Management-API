import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';

const router = Router();

router.post('/', teacherController.create);
router.get('/', teacherController.getAll);
router.get('/:id', teacherController.getOne);
router.put('/:id', teacherController.update);
router.put('/:id/enroll-course', teacherController.enrollCourse);
router.put('/:id/remove-course', teacherController.removeCourse);
router.delete('/:id', teacherController.remove);

export default router;