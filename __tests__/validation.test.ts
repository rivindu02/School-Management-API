// __tests__/validation.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/school_db_test';

import app from '../src/index';

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Validation Middleware Tests', () => {
  describe('Course Validation', () => {
    it('should return validation error with proper structure', async () => {
      const res = await request(app)
        .post('/courses')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should validate title is a string', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 123, // Invalid type
          code: 'CS101',
          credits: 3
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate code is a string', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Math',
          code: 123, // Invalid type
          credits: 3
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate credits is a number', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Math',
          code: 'CS101',
          credits: 'three' // Invalid type
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate credits is positive', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Math',
          code: 'CS101',
          credits: 0 // Not positive
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('Student Validation', () => {
    it('should validate name minimum length', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'A', // Too short
          email: 'test@example.com',
          age: 20
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'John Doe',
          email: 'not-an-email',
          age: 20
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate age is a number', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          age: 'twenty' // Invalid type
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate age is positive', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          age: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate age maximum', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          age: 150
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('Teacher Validation', () => {
    it('should validate name minimum length', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          name: 'D', // Too short
          email: 'teacher@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          name: 'Dr. Smith',
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('Enrollment Validation', () => {
    let studentId: string;
    let teacherId: string;

    beforeAll(async () => {
      const studentRes = await request(app)
        .post('/students')
        .send({
          name: 'Test Student',
          email: 'test.student@example.com',
          age: 20
        });
      studentId = studentRes.body._id;

      const teacherRes = await request(app)
        .post('/teachers')
        .send({
          name: 'Test Teacher',
          email: 'test.teacher@example.com'
        });
      teacherId = teacherRes.body._id;
    });

    it('should validate courseId is required for student enrollment', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is a string for student enrollment', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .send({
          courseId: 123 // Invalid type
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is required for teacher enrollment', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is required for student removal', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/remove-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is required for teacher removal', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/remove-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('Partial Update Validation', () => {
    let courseId: string;
    let studentId: string;
    let teacherId: string;

    beforeAll(async () => {
      const courseRes = await request(app)
        .post('/courses')
        .send({
          title: 'Test Course',
          code: 'TEST101',
          credits: 3
        });
      courseId = courseRes.body._id;

      const studentRes = await request(app)
        .post('/students')
        .send({
          name: 'Update Test Student',
          email: 'update.test@example.com',
          age: 20
        });
      studentId = studentRes.body._id;

      const teacherRes = await request(app)
        .post('/teachers')
        .send({
          name: 'Update Test Teacher',
          email: 'update.teacher@example.com'
        });
      teacherId = teacherRes.body._id;
    });

    it('should allow partial course update', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .send({
          title: 'Updated Title Only'
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title Only');
    });

    it('should allow partial student update', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .send({
          age: 21
        });

      expect(res.status).toBe(200);
      expect(res.body.age).toBe(21);
    });

    it('should allow partial teacher update', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .send({
          name: 'Dr. Updated'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Dr. Updated');
    });

    it('should still validate types on partial update', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .send({
          age: 'invalid' // Wrong type
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });
});
