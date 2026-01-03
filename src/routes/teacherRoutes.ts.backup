// src/routes/teacherRoutes.ts
import { Router, Request, Response } from 'express';
import Teacher from '../models/Teacher';
import Course from '../models/Course';

const router = Router();


router.post('/', async (req: Request, res: Response) => {
  try {
    // Modern way
    const newTeacher = await Teacher.create(req.body);

    // 4. Send back the saved data as confirmation
    res.status(201).json(newTeacher);

    
  } catch (error) {
    // If something goes wrong (like a duplicate email), tell the user
    res.status(400).json({ message: 'Error creating teacher', error });
  }
});

//The "Read" Endpoints (GET)
// READ ALL Teachers
router.get('/', async (req: Request, res: Response) => {
  try {
    // with the find method we can get all teacher obeject ids 
    //const teachers = await Teacher.find(); // Mongoose magic to get everything

    const teachers = await Teacher.find().populate('courses'); // here populate method fetches the course details for each teacher
    // so it displays the complete course objects instead of just their IDs {"_id":"692f603febe128b70eacd11c","name":"David Joe","email":"DavidJ@student.com","age":25,"courses":[{"_id":"692f676cebe128b70eacd13b","title":"DSA","code":"CS3530","credits":3,"__v":0},{"_id":"692f689bc8be802b5466ee98","title":"EDR","code":"EN4531","credits":3,"__v":0}],"__v":0}
    // if we didn't use populate here, it would just show an array of course IDs for each teacher

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
});

// READ ONE Teacher
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('courses');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher', error });
  }
});

// UPDATE a Teacher ---only update, can't enroll to new courses or remove courses
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // findByIdAndUpdate takes 3 arguments:
    // 1. The ID to find
    // 2. The data to update (req.body)
    // 3. Options: { new: true } tells Mongoose to return the *updated* version, not the old one.
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: 'Error updating teacher', error });
  }
});



// ENROLL a Teacher in a Course
router.put('/:id/enroll-course', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body; // Expecting ex: { "courseId": "EE2345" }
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { courses: courseId } }, //%%%%%%%%%%%%%% addToSet prevents duplicates(MongoDB update operator) and purpose is to add a value to an array only if the value is not already present in that array
      { new: true }
    ).populate('courses');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  }

  catch(error) {
    res.status(500).json({ message: 'Error enrolling teacher in course', error });
  }

});

// REMOVE a Teacher from a Course
router.put('/:id/remove-course', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body; // Expecting ex: { "courseId": "_Id for the course" }
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $pull: { courses: courseId } }, //%%%%%%%%%%%%%% pull removes the value from the array if it exists
      { new: true }
    ).populate('courses');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  }

  catch(error) {
    res.status(500).json({ message: 'Error removing teacher from course', error });
  }

});

// DELETE a Teacher
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!deletedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error });
  }
});

export default router;