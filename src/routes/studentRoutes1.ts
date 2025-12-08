// src/routes/studentRoutes.ts
import { Router, Request, Response } from 'express';
import Student from '../models/Student';
import Course from '../models/Course';

const router = Router();

// CREATE a new Student
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Get data from the user (the "Body" of the request)
    const { name, email, age, course } = req.body;

    // 2. Create a new Student object
    const newStudent = new Student({
      name,
      email,
      age,
      course
    });

    // 3. Save to MongoDB
    const savedStudent = await newStudent.save();

    // #####################
    // 1,2,3 steps can be done using const newStudent = await Student.create(req.body);

    // 4. Send back the saved data as confirmation
    res.status(201).json(savedStudent);

    
  } catch (error) {
    // If something goes wrong (like a duplicate email), tell the user
    res.status(400).json({ message: 'Error creating student', error });
  }
});

//The "Read" Endpoints (GET)
// READ ALL Students
router.get('/', async (req: Request, res: Response) => {
  try {
    // with the find method we can get all sudent obeject ids 
    //const students = await Student.find(); // Mongoose magic to get everything

    const students = await Student.find().populate('courses'); // here populate method fetches the course details for each student
    // so it displays the complete course objects instead of just their IDs

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
});

// READ ONE Student
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id).populate('courses');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error });
  }
});

// UPDATE a Student ---only update, can't enroll to new courses or remove courses
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // findByIdAndUpdate takes 3 arguments:
    // 1. The ID to find
    // 2. The data to update (req.body)
    // 3. Options: { new: true } tells Mongoose to return the *updated* version, not the old one.
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating student', error });
  }
});



// ENROLL a Student in a Course
router.put('/:id/enroll-course', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body; // Expecting ex: { "courseId": "EE2345" }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { courses: courseId } }, //%%%%%%%%%%%%%% addToSet prevents duplicates(MongoDB update operator) and purpose is to add a value to an array only if the value is not already present in that array
      { new: true }
    ).populate('courses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  }

  catch(error) {
    res.status(500).json({ message: 'Error enrolling student in course', error });
  }

});

// REMOVE a Student from a Course
router.put('/:id/remove-course', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body; // Expecting ex: { "courseId": "EE2345" }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $pull: { courses: courseId } }, //%%%%%%%%%%%%%% pull removes the value from the array if it exists
      { new: true }
    ).populate('courses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  }

  catch(error) {
    res.status(500).json({ message: 'Error removing student from course', error });
  }

});

// DELETE a Student
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error });
  }
});

export default router;