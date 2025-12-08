// __tests__/course.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/school_db_test';

import app from '../src/index';
import Course from '../src/models/Course';

jest.setTimeout(30000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Course API Tests', () => {
  let courseId: string;

  describe('POST /courses - Create Course', () => {
    it('should create a new course with valid data', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Data Structures',
          code: 'CS101',
          credits: 3
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Data Structures');
      expect(res.body.code).toBe('CS101');
      expect(res.body.credits).toBe(3);
      courseId = res.body._id;
    });

    it('should reject course creation with missing title', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          code: 'CS102',
          credits: 3
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject course creation with missing code', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Algorithms',
          credits: 3
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject course creation with missing credits', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Algorithms',
          code: 'CS102'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject course creation with negative credits', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Algorithms',
          code: 'CS102',
          credits: -1
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject duplicate course code', async () => {
      const res = await request(app)
        .post('/courses')
        .send({
          title: 'Another Data Structures',
          code: 'CS101', // Duplicate
          credits: 4
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Error creating course');
    });
  });

  describe('GET /courses - Get All Courses', () => {
    it('should retrieve all courses', async () => {
      const res = await request(app).get('/courses');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /courses/:id - Get Single Course', () => {
    it('should retrieve a course by ID', async () => {
      const res = await request(app).get(`/courses/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(courseId);
      expect(res.body.title).toBe('Data Structures');
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/courses/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Course not found');
    });

    it('should return 500 for invalid course ID format', async () => {
      const res = await request(app).get('/courses/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /courses/:id - Update Course', () => {
    it('should update course title', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .send({
          title: 'Advanced Data Structures'
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Advanced Data Structures');
      expect(res.body.code).toBe('CS101'); // Unchanged
    });

    it('should update course credits', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .send({
          credits: 4
        });

      expect(res.status).toBe(200);
      expect(res.body.credits).toBe(4);
    });

    it('should update multiple fields at once', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .send({
          title: 'Data Structures & Algorithms',
          credits: 5
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Data Structures & Algorithms');
      expect(res.body.credits).toBe(5);
    });

    it('should return 404 for non-existent course update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/courses/${fakeId}`)
        .send({
          title: 'New Title'
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Course not found');
    });

    it('should reject updating to duplicate course code', async () => {
      // Create another course
      const course2 = await request(app)
        .post('/courses')
        .send({
          title: 'Algorithms',
          code: 'CS102',
          credits: 3
        });

      // Try to update first course to use second course's code
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .send({
          code: 'CS102'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Course code is already in use');
    });
  });

  describe('DELETE /courses/:id - Delete Course', () => {
    it('should delete a course', async () => {
      // Create a course to delete
      const createRes = await request(app)
        .post('/courses')
        .send({
          title: 'Temporary Course',
          code: 'TEMP101',
          credits: 1
        });

      const tempCourseId = createRes.body._id;

      const res = await request(app).delete(`/courses/${tempCourseId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Course deleted successfully');

      // Verify it's deleted
      const getRes = await request(app).get(`/courses/${tempCourseId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/courses/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Course not found');
    });
  });
});
