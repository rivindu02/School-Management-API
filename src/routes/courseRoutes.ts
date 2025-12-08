import { Router } from 'express';
import * as courseController from '../controllers/courseController';

const router = Router();

router.post('/', courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', courseController.getOne);
router.put('/:id', courseController.update);
router.delete('/:id', courseController.remove);
export default router;