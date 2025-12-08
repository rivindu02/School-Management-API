// __tests__/teacher.test.ts
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

describe('Teacher API Tests', () => {
  let teacherId: string;
  let courseId: string;
  let enrollTestTeacherId: string;

  // Create a course first for enrollment tests
  beforeAll(async () => {
    const courseRes = await request(app)
      .post('/courses')
      .send({
        title: 'Physics',
        code: 'PHY101',
        credits: 4
      });
    courseId = courseRes.body._id;

    // Create a fresh teacher for enrollment tests
    const enrollRes = await request(app)
      .post('/teachers')
      .send({
        name: 'Enroll Test Teacher',
        email: 'enroll.teacher@example.com'
      });
    enrollTestTeacherId = enrollRes.body._id;
  });

  describe('POST /teachers - Create Teacher', () => {
    it('should create a new teacher with valid data', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          name: 'Dr. Smith',
          email: 'dr.smith@example.com'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Dr. Smith');
      expect(res.body.email).toBe('dr.smith@example.com');
      teacherId = res.body._id;
    });

    it('should reject teacher creation with missing name', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          email: 'teacher@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject teacher creation with invalid email', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          name: 'Dr. Jones',
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject teacher creation with short name', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          name: 'D',
          email: 'd@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/teachers')
        .send({
          name: 'Dr. Smith Clone',
          email: 'dr.smith@example.com' // Duplicate
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Error creating teacher');
    });
  });

  describe('GET /teachers - Get All Teachers', () => {
    it('should retrieve all teachers', async () => {
      const res = await request(app).get('/teachers');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /teachers/:id - Get Single Teacher', () => {
    it('should retrieve a teacher by ID', async () => {
      const res = await request(app).get(`/teachers/${teacherId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(teacherId);
      expect(res.body.name).toBe('Dr. Smith');
    });

    it('should return 404 for non-existent teacher', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/teachers/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });

    it('should return 500 for invalid teacher ID format', async () => {
      const res = await request(app).get('/teachers/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /teachers/:id - Update Teacher', () => {
    it('should update teacher name', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .send({
          name: 'Dr. Updated Smith'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Dr. Updated Smith');
    });

    it('should update teacher email', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .send({
          email: 'dr.smith.updated@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('dr.smith.updated@example.com');
    });

    it('should return 404 for non-existent teacher update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${fakeId}`)
        .send({
          name: 'New Name'
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });

    it('should reject updating to duplicate email', async () => {
      // Create another teacher
      const teacher2 = await request(app)
        .post('/teachers')
        .send({
          name: 'Dr. Jones',
          email: 'dr.jones@example.com'
        });

      // Try to update first teacher to use second teacher's email
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .send({
          email: 'dr.jones@example.com'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email is already taken by another teacher');
    });
  });

  describe('PUT /teachers/:id/enroll-course - Assign to Course', () => {
    it('should assign teacher to a course', async () => {
      const res = await request(app)
        .put(`/teachers/${enrollTestTeacherId}/enroll-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1);
    });

    it('should not duplicate assignment to same course', async () => {
      // Try to assign to same course again
      const res = await request(app)
        .put(`/teachers/${enrollTestTeacherId}/enroll-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1); // Still only 1
    });

    it('should reject assignment with missing courseId', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent course assignment', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .send({ courseId: fakeCourseId.toString() });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Cannot enroll: Course not found');
    });

    it('should return 404 for non-existent teacher assignment', async () => {
      const fakeTeacherId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${fakeTeacherId}/enroll-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PUT /teachers/:id/remove-course - Remove from Course', () => {
    it('should remove teacher from a course', async () => {
      const res = await request(app)
        .put(`/teachers/${enrollTestTeacherId}/remove-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(0);
    });

    it('should reject removal with missing courseId', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/remove-course`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent teacher removal', async () => {
      const fakeTeacherId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${fakeTeacherId}/remove-course`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });
  });

  describe('DELETE /teachers/:id - Delete Teacher', () => {
    it('should delete a teacher', async () => {
      // Create a teacher to delete
      const createRes = await request(app)
        .post('/teachers')
        .send({
          name: 'Temp Teacher',
          email: 'temp.teacher@example.com'
        });

      const tempTeacherId = createRes.body._id;

      const res = await request(app).delete(`/teachers/${tempTeacherId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Teacher deleted successfully');

      // Verify it's deleted
      const getRes = await request(app).get(`/teachers/${tempTeacherId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent teacher', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/teachers/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });
  });
});
