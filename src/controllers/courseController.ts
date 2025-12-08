import { Request, Response } from 'express';
import * as courseService from '../services/courseService';
import { AppError } from '../utils/AppError';

export const create = async (req: Request, res: Response) => {
  try {
    const newCourse = await courseService.createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: 'Error creating course', error });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    // Handle the custom thrown error
    if (error instanceof AppError) {      //This operator checks if the object on the left (error) was created by the constructor function on the right (AppError).
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error fetching courses', error });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.json(course);
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error fetching course', error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const updatedCourse = await courseService.updateCourse(req.params.id, req.body);
    res.json(updatedCourse);
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(400).json({ message: 'Error updating course', error });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting course', error });
  }
};