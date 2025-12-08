import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from './models/Student';
import Course from './models/Course';
import Teacher from './models/Teacher';

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies (important for POST/PUT requests later)
app.use(express.json());

// 1. The Database Connection
// NOTICEEEEEEE**: We use 'mongo' as the hostname, not 'localhost'.
// This is because in Docker, we will name our database service 'mongo'.
const MONGO_URI = 'mongodb://mongo:27017/school_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB via Docker!'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 2. A Simple Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running inside Docker!');
});





// The "Create" Endpoint (POST)
// CREATE a new Student
app.post('/students', async (req: Request, res: Response) => {
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
app.get('/students', async (req: Request, res: Response) => {
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
app.get('/students/:id', async (req: Request, res: Response) => {
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
app.put('/students/:id', async (req: Request, res: Response) => {
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
app.put('/students/:id/enroll-course', async (req: Request, res: Response) => {
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
app.put('/students/:id/remove-course', async (req: Request, res: Response) => {
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
app.delete('/students/:id', async (req: Request, res: Response) => {
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













////////////////////////////////////////////////////////////////////////////////

// Teacher routes
// The "Create" Endpoint (POST)
// CREATE a new Student
app.post('/teachers', async (req: Request, res: Response) => {
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
app.get('/teachers', async (req: Request, res: Response) => {
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
app.get('/teachers/:id', async (req: Request, res: Response) => {
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
app.put('/teachers/:id', async (req: Request, res: Response) => {
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
app.put('/teachers/:id/enroll-course', async (req: Request, res: Response) => {
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
app.put('/teachers/:id/remove-course', async (req: Request, res: Response) => {
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
app.delete('/teachers/:id', async (req: Request, res: Response) => {
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


////////////////////////////////////////////////
// Course routes
app.post('/courses', async (req: Request, res: Response) => {
  try{
    const newCourse = await Course.create(req.body);
    res.status(201).json(newCourse);

  } catch (error) {
    res.status(400).json({ message: 'Error creating course', error });
  }
});

// READ ALL Courses
app.get('/courses', async (req: Request, res: Response) => {
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
app.get('/courses/:id', async (req: Request, res: Response) => {
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
app.put('/courses/:id', async (req: Request, res: Response) => {
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
app.delete('/courses/:id', async (req: Request, res: Response) => {
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


// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});