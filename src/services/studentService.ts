import Student from '../models/Student';
import Course from '../models/Course'; 
import { AppError } from '../utils/AppError';

export const createStudent = async (data: any) => {
  // 1. Check for missing fields
  // if (!data.name || !data.email ) {
  //   throw new AppError(400, 'Please provide name and email');
  // }


  // 2. Check for Duplicates (Email)
  const existingStudent = await Student.findOne({ email: data.email });
  if (existingStudent) {
    throw new AppError(409, 'Student with this email already exists');
  }

  return await Student.create(data);
};

export const getAllStudents = async () => {
  const students = await Student.find().populate('courses');
  // Optional: Throw error if database is strictly empty
  // if (!students.length) throw new AppError(404, 'No students found');
  return students;
};

export const getStudentById = async (id: string) => {
  const student = await Student.findById(id).populate('courses');
  if (!student) {
    throw new AppError(404, 'Student not found');
  }
  return student;
};

export const updateStudent = async (id: string, data: any) => {
  // Prevent updating email to one that already exists
  if (data.email) {
    const existingStudent = await Student.findOne({ email: data.email });
    // Ensure we found a student AND it's not the current student we are updating
    if (existingStudent && existingStudent._id.toString() !== id) {
      throw new AppError(409, 'Email is already taken by another student');
    }
  }

  const updatedStudent = await Student.findByIdAndUpdate(id, data, { new: true });
  if (!updatedStudent) {
    throw new AppError(404, 'Student not found');
  }
  return updatedStudent;
};

export const enrollStudentInCourse = async (studentId: string, courseId: string) => {
  // 1. Verify the Course actually exists!
  const courseExists = await Course.findById(courseId);
  if (!courseExists) {
    throw new AppError(404, 'Cannot enroll: Course not found');
  }

  // 2. Perform the update
  const student = await Student.findByIdAndUpdate(
    studentId,
    { $addToSet: { courses: courseId } },
    { new: true }
  ).populate('courses');

  if (!student) {
    throw new AppError(404, 'Student not found');
  }
  return student;
};

export const removeStudentFromCourse = async (studentId: string, courseId: string) => {
  const student = await Student.findByIdAndUpdate(
    studentId,
    { $pull: { courses: courseId } },
    { new: true }
  ).populate('courses');

  if (!student) {
    throw new AppError(404, 'Student not found');
  }
  return student;
};

export const deleteStudent = async (id: string) => {
  const deletedStudent = await Student.findByIdAndDelete(id);
  if (!deletedStudent) {
    throw new AppError(404, 'Student not found');
  }
  return deletedStudent;
};