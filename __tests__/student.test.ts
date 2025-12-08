// __tests__/student.test.ts
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

describe('Student API Tests', () => {
  let studentId: string;
  let courseId: string;
  let enrollTestStudentId: string;

  // Create a course first for enrollment tests
  beforeAll(async () => {
    const courseRes = await request(app)
      .post('/courses')
      .send({
        title: 'Mathematics',
        code: 'MATH101',
        credits: 4
      });
    courseId = courseRes.body._id;

    // Create a fresh student for enrollment tests
    const enrollRes = await request(app)
      .post('/students')
      .send({
        name: 'Enroll Test Student',
        email: 'enroll.test@example.com',
        age: 20
      });
    enrollTestStudentId = enrollRes.body._id;
  });

  describe('POST /students - Create Student', () => {
    it('should create a new student with valid data', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          age: 20
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john.doe@example.com');
      expect(res.body.age).toBe(20);
      studentId = res.body._id;
    });

    it('should reject student creation with missing name', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          email: 'student@example.com',
          age: 21
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject student creation with invalid email', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'Jane Smith',
          email: 'invalid-email',
          age: 22
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject student creation with missing age', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject student creation with negative age', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: -5
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject student creation with age over 120', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: 150
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject student creation with short name', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'J',
          email: 'j@example.com',
          age: 20
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/students')
        .send({
          name: 'John Clone',
          email: 'john.doe@example.com', // Duplicate
          age: 21
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Error creating student');
    });
  });

  describe('GET /students - Get All Students', () => {
    it('should retrieve all students', async () => {
      const res = await request(app).get('/students');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /students/:id - Get Single Student', () => {
    it('should retrieve a student by ID', async () => {
      const res = await request(app).get(`/students/${studentId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(studentId);
      expect(res.body.name).toBe('John Doe');
    });

    it('should return 404 for non-existent student', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/students/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });

    it('should return 500 for invalid student ID format', async () => {
      const res = await request(app).get('/students/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /students/:id - Update Student', () => {
    it('should update student name', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .send({
          name: 'John Updated Doe'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('John Updated Doe');
    });

    it('should update student age', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .send({
          age: 21
        });

      expect(res.status).toBe(200);
      expect(res.body.age).toBe(21);
    });

    it('should return 404 for non-existent student update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${fakeId}`)
        .send({
          name: 'New Name'
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });

    it('should reject updating to duplicate email', async () => {
      // Create another student
      const student2 = await request(app)
        .post('/students')
        .send({
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          age: 22
        });

      // Try to update first student to use second student's email
      const res = await request(app)
        .put(`/students/${studentId}`)
        .send({
          email: 'jane.smith@example.com'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email is already taken by another student');
    });
  });

  describe('PUT /students/:id/enroll-course - Enroll in Course', () => {
    it('should enroll student in a course', async () => {
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/enroll-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1);
    });

    it('should not duplicate enrollment in same course', async () => {
      // Try to enroll in same course again
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/enroll-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1); // Still only 1
    });

    it('should reject enrollment with missing courseId', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent course enrollment', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .send({ courseId: fakeCourseId.toString() });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Cannot enroll: Course not found');
    });

    it('should return 404 for non-existent student enrollment', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${fakeStudentId}/enroll-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PUT /students/:id/remove-course - Remove from Course', () => {
    it('should remove student from a course', async () => {
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/remove-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(0);
    });

    it('should reject removal with missing courseId', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/remove-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent student removal', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${fakeStudentId}/remove-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });
  });

  describe('DELETE /students/:id - Delete Student', () => {
    it('should delete a student', async () => {
      // Create a student to delete
      const createRes = await request(app)
        .post('/students')
        .send({
          name: 'Temp Student',
          email: 'temp@example.com',
          age: 19
        });

      const tempStudentId = createRes.body._id;

      const res = await request(app).delete(`/students/${tempStudentId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Student deleted successfully');

      // Verify it's deleted
      const getRes = await request(app).get(`/students/${tempStudentId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent student', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/students/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });
  });
});
