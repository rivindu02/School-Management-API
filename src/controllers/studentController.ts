import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import { AppError } from '../utils/AppError';

export const create = async (req: Request, res: Response) => {
  try {
    const newStudent = await studentService.createStudent(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating student', error });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const students = await studentService.getAllStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json(student);
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error fetching student', error });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const updatedStudent = await studentService.updateStudent(req.params.id, req.body);
    res.json(updatedStudent);
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(400).json({ message: 'Error updating student', error });
  }
};

export const enrollCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const student = await studentService.enrollStudentInCourse(req.params.id, courseId);
    res.json(student);
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error enrolling student', error });
  }
};

export const removeCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const student = await studentService.removeStudentFromCourse(req.params.id, courseId);
    res.json(student);
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error removing course', error });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting student', error });
  }
};