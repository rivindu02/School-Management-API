import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { validate } from '../middleware/validate';
import { createTeacherSchema, updateTeacherSchema, enrollSchema } from '../schemas/teacherSchema';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
// Public GET routes (no auth required)
/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 */
router.get('/', authenticate, teacherController.getAll);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Teacher not found
 */
router.get('/:id', authenticate, teacherController.getOne);

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher (Admin only)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Mathematics
 *               email:
 *                 type: string
 *                 format: email
 *                 example: teacher@test.com
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/', authenticate, authorize('admin'), validate(createTeacherSchema), teacherController.create);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update teacher (Authenticated users)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Teacher not found
 */
router.put('/:id', authenticate, validate(updateTeacherSchema), teacherController.update);

/**
 * @swagger
 * /teachers/{id}/enroll-course:
 *   put:
 *     summary: Enroll teacher in a course (Authenticated users)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollRequest'
 *     responses:
 *       200:
 *         description: Teacher enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad request - Already enrolled or invalid course
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Teacher or course not found
 */
router.put('/:id/enroll-course', authenticate, validate(enrollSchema), teacherController.enrollCourse);

/**
 * @swagger
 * /teachers/{id}/remove-course:
 *   put:
 *     summary: Remove teacher from a course (Authenticated users)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollRequest'
 *     responses:
 *       200:
 *         description: Teacher removed from course successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Teacher or course not found
 */
router.put('/:id/remove-course', authenticate, validate(enrollSchema), teacherController.removeCourse);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete teacher (Admin only)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Teacher not found
 */
router.delete('/:id', authenticate, authorize('admin'), teacherController.remove);

export default router;