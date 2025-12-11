import Teacher from '../models/Teacher';
import Course from '../models/Course'; 
import { AppError } from '../utils/AppError';


export const createTeacher = async (data: any) => {
  const existingTeacher = await Teacher.findOne({ email: data.email });
  if (existingTeacher) {
    throw new AppError(409, 'Teacher with this email already exists');
  }
  return await Teacher.create(data);
};

export const getAllTeachers = async () => {
  return await Teacher.find().populate('courses');
};

export const getTeacherById = async (id: string) => {
  const teacher = await Teacher.findById(id).populate('courses');
  if (!teacher) throw new AppError(404, 'Teacher not found');
  return teacher;
};

export const updateTeacher = async (id: string, data: any) => {
  if (data.email) {
    const existingTeacher = await Teacher.findOne({ email: data.email });
    if (existingTeacher && existingTeacher._id.toString() !== id) {
      throw new AppError(409, 'Email is already taken by another teacher');
    }
  }

  const updatedTeacher = await Teacher.findByIdAndUpdate(id, data, { new: true });
  if (!updatedTeacher) throw new AppError(404, 'Teacher not found');
  return updatedTeacher;
};

export const enrollTeacherInCourse = async (teacherId: string, courseId: string) => {
  // 1. Verify the Course actually exists!
  const courseExists = await Course.findById(courseId);
  if (!courseExists) {
    throw new AppError(404, 'Cannot enroll: Course not found');
  }
  // 2. Perform the update
  const teacher = await Teacher.findByIdAndUpdate(
    teacherId,
    { $addToSet: { courses: courseId } },
    { new: true }
  ).populate('courses');
  if (!teacher) throw new AppError(404, 'Teacher not found');
  return teacher;
};

export const removeTeacherFromCourse = async (teacherId: string, courseId: string) => {
  const teacher = await Teacher.findByIdAndUpdate(
    teacherId,
    { $pull: { courses: courseId } },
    { new: true }
  ).populate('courses');
  if (!teacher) throw new AppError(404, 'Teacher not found');
  return teacher;
};

export const deleteTeacher = async (id: string) => {
  const teacher = await Teacher.findByIdAndDelete(id);
  if (!teacher) throw new AppError(404, 'Teacher not found');
  return teacher;
};