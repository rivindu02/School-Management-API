// src/routes/courseRoutes.ts
import { Router, Request, Response } from 'express';
import Course from '../models/Course';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try{
    const newCourse = await Course.create(req.body);
    res.status(201).json(newCourse);

  } catch (error) {
    res.status(400).json({ message: 'Error creating course', error });
  }
});

// READ ALL Courses
router.get('/', async (req: Request, res: Response) => {
  try{
    const courses = await Course.find();
    if (!courses) {
      return res.status(404).json({ message: 'No courses found' });
    }
    res.json(courses);
  }catch(error){
    res.status(500).json({ message: 'Error fetching courses', error });
  }

});

// READ ONE Course
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error });
  }
});
// UPDATE a Course
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating course', error });
  }
});

// DELETE a Course
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error });
  }
});

export default router;