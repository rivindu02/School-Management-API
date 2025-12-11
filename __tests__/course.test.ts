// __tests__/course.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/school_db_test';

import app from '../src/app';
import Course from '../src/models/Course';
import User from '../src/models/User';

jest.setTimeout(30000);

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connection.dropDatabase();

  // Create an admin user and get token
  const adminRes = await request(app)
    .post('/auth/register')
    .send({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
  adminToken = adminRes.body.token;

  // Create a regular user and get token
  const userRes = await request(app)
    .post('/auth/register')
    .send({
      username: 'testuser',
      email: 'testuser@test.com',
      password: 'password123',
      role: 'user'
    });
  userToken = userRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Course API Tests', () => {
  let courseId: string;

  describe('POST /courses - Create Course', () => {
    it('should create a new course with admin token', async () => {
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
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

    it('should reject course creation by regular user', async () => {
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Algorithms',
          code: 'CS102',
          credits: 3
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should reject course creation with missing title', async () => {
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
    it('should retrieve all courses without authentication', async () => {
      const res = await request(app)
        .get('/courses');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /courses/:id - Get Single Course', () => {
    it('should retrieve a course by ID without authentication', async () => {
      const res = await request(app)
        .get(`/courses/${courseId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(courseId);
      expect(res.body.title).toBe('Data Structures');
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/courses/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Course not found');
    });

    it('should return 500 for invalid course ID format', async () => {
      const res = await request(app)
        .get('/courses/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /courses/:id - Update Course', () => {
    it('should update course title', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${userToken}`)
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
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          credits: 4
        });

      expect(res.status).toBe(200);
      expect(res.body.credits).toBe(4);
    });

    it('should update multiple fields at once', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${userToken}`)
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
        .set('Authorization', `Bearer ${userToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Algorithms',
          code: 'CS102',
          credits: 3
        });

      // Try to update first course to use second course's code
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          code: 'CS102'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Course code is already in use');
    });
  });

  describe('DELETE /courses/:id - Delete Course', () => {
    it('should allow admin to delete a course', async () => {
      // Create a course to delete
      const createRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Temporary Course',
          code: 'TEMP101',
          credits: 1
        });

      const tempCourseId = createRes.body._id;

      const res = await request(app)
        .delete(`/courses/${tempCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Course deleted successfully');

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/courses/${tempCourseId}`);
      expect(getRes.status).toBe(404);
    });

    it('should reject regular user from deleting a course', async () => {
      const res = await request(app)
        .delete(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should return 404 when deleting non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/courses/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Course not found');
    });
  });

  describe('Duplicate Data Handling', () => {
    it('should reject creating course with duplicate code', async () => {
      const courseData = {
        title: 'Duplicate Code Course',
        code: 'DUPLICATE101',
        credits: 3
      };

      // Create first course
      await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData)
        .expect(201);

      // Try to create duplicate
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData)
        .expect([400, 409]);

      expect(res.body.message).toBeDefined();
    });

    it('should allow updating course with same code', async () => {
      const createRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Same Code Course',
          code: 'SAMECODE101',
          credits: 3
        })
        .expect(201);

      const id = createRes.body._id;

      // Update with same code should succeed
      const res = await request(app)
        .put(`/courses/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Same Code Course Updated',
          code: 'SAMECODE101',
          credits: 3
        })
        .expect(200);

      expect(res.body.title).toBe('Same Code Course Updated');
    });

    it('should reject updating course with another courses code', async () => {
      // Create two courses
      const course1 = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Course One',
          code: 'COURSE101',
          credits: 3
        })
        .expect(201);

      await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Course Two',
          code: 'COURSE102',
          credits: 3
        })
        .expect(201);

      // Try to update course1 with course2's code
      const res = await request(app)
        .put(`/courses/${course1.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Course One',
          code: 'COURSE102',
          credits: 3
        })
        .expect([400, 409]);

      expect(res.body.message).toBeDefined();
    });
  });

  describe('Course with Enrollments', () => {
    it('should delete course even with enrolled students', async () => {
      // Create course, student, and enroll
      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Course to Delete',
          code: 'TODELETE101',
          credits: 3
        })
        .expect(201);

      const studentRes = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Enrolled Student',
          email: 'enrolled-student@test.com',
          age: 21,
          grade: 'B'
        })
        .expect(201);

      // Enroll student in course
      await request(app)
        .put(`/students/${studentRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Delete course - should succeed
      await request(app)
        .delete(`/courses/${courseRes.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/courses/${courseRes.body._id}`)
        .expect(404);
    });

    it('should delete course with assigned teachers', async () => {
      // Create course and teacher
      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Course with Teacher',
          code: 'WITHTEACHER101',
          credits: 3
        })
        .expect(201);

      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Prof. Test',
          email: 'prof-test-integ@test.com',
          subject: 'Testing',
          experience: 5
        })
        .expect(201);

      // Assign teacher to course
      await request(app)
        . put(`/teachers/${teacherRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Delete course - should succeed
      await request(app)
        .delete(`/courses/${courseRes.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/courses/${courseRes.body._id}`)
        .expect(404);
    });
  });

  describe('Data Integrity', () => {
    it('should handle empty courses list', async () => {
      const res = await request(app)
        .get('/courses')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should maintain referential integrity after multiple enrollments', async () => {
      // Create a course
      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Popular Course',
          code: 'POPULAR101',
          credits: 3
        })
        .expect(201);

      // Create multiple students and enroll them
      const studentIds = [];
      for (let i = 0; i < 3; i++) {
        const studentRes = await request(app)
          .post('/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Student ${i}`,
            email: `student${i}-popular@test.com`,
            age: 20 + i,
            grade: 'A'
          })
          .expect(201);
        
        studentIds.push(studentRes.body._id);

        await request(app)
          .put(`/students/${studentRes.body._id}/enroll-course`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ courseId: courseRes.body._id })
          .expect(200);
      }

      // Verify all students are enrolled
      for (const studentId of studentIds) {
        const getRes = await request(app)
          .get(`/students/${studentId}`)
          .expect(200);
        
        expect(getRes.body.courses.length).toBeGreaterThan(0);
      }
    });
  });
});
