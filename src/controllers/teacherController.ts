import { Request, Response } from 'express';
import * as teacherService from '../services/teacherService';
import { AppError } from '../utils/AppError';

export const create = async (req: Request, res: Response) => {
  try {
    const newTeacher = await teacherService.createTeacher(req.body);
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(400).json({ message: 'Error creating teacher', error });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const teachers = await teacherService.getAllTeachers();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.json(teacher);
  } catch (error) {
    if (error instanceof AppError) res.status(error.statusCode).json({ message: error.message });
    else res.status(500).json({ message: 'Error fetching teacher', error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const updatedTeacher = await teacherService.updateTeacher(req.params.id, req.body);
    res.json(updatedTeacher);
  } catch (error) {
    if (error instanceof AppError) res.status(error.statusCode).json({ message: error.message });
    else res.status(400).json({ message: 'Error updating teacher', error });
  }
};

export const enrollCourse = async (req: Request, res: Response) => {
  try {
    const teacher = await teacherService.enrollTeacherInCourse(req.params.id, req.body.courseId);
    res.json(teacher);
  } catch (error) {
    if (error instanceof AppError) res.status(error.statusCode).json({ message: error.message });
    else res.status(500).json({ message: 'Error enrolling teacher', error });
  }
};

export const removeCourse = async (req: Request, res: Response) => {
  try {
    const teacher = await teacherService.removeTeacherFromCourse(req.params.id, req.body.courseId);
    res.json(teacher);
  } catch (error) {
    if (error instanceof AppError) res.status(error.statusCode).json({ message: error.message });
    else res.status(500).json({ message: 'Error removing course', error });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await teacherService.deleteTeacher(req.params.id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) res.status(error.statusCode).json({ message: error.message });
    else res.status(500).json({ message: 'Error deleting teacher', error });
  }
};