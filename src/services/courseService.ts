import Course from '../models/Course';
import { AppError } from '../utils/AppError';

export const createCourse = async (data: any) => {
  // 1. Check Required Fields
  // if (!data.title || !data.code || !data.credits) {
  //   throw new AppError(400, 'Please provide title, code, and credits');
  // }

  // // 2. Validate Logic (Credits)
  // if (data.credits <= 0) {
  //   throw new AppError(400, 'Credits must be greater than 0');
  // }

  // 3. Check for Duplicate Course Code
  const existingCourse = await Course.findOne({ code: data.code });
  if (existingCourse) {
    throw new AppError(409, 'Course with this code already exists');
  }

  return await Course.create(data);
};

export const getAllCourses = async () => {
  const courses = await Course.find();
  return courses;
};

export const getCourseById = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) {
    throw new AppError(404, 'Course not found');
  }
  return course;
};

export const updateCourse = async (id: string, data: any) => {

  // Check for updating code to one that already exists
  if (data.code) {
    const existingCourse = await Course.findOne({ code: data.code });
    if (existingCourse && existingCourse._id.toString() !== id) {   // hv to convert to string to compare
      throw new AppError(409, 'Course code is already in use');
    }
  }

  const updatedCourse = await Course.findByIdAndUpdate(id, data, { new: true });
  if (!updatedCourse) {
    throw new AppError(404, 'Course not found');
  }
  return updatedCourse;
};

export const deleteCourse = async (id: string) => {
  const deletedCourse = await Course.findByIdAndDelete(id);
  if (!deletedCourse) {
    throw new AppError(404, 'Course not found');
  }
  return deletedCourse;
};