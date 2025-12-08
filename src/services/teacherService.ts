import Teacher from '../models/Teacher';
import { AppError } from '../utils/AppError';

export const createTeacher = async (data: any) => {
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
  const teacher = await Teacher.findByIdAndUpdate(id, data, { new: true });
  if (!teacher) throw new AppError(404, 'Teacher not found');
  return teacher;
};

export const enrollTeacherInCourse = async (teacherId: string, courseId: string) => {
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