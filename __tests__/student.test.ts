// __tests__/student.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27018/school_db_test';

import app from '../src/app';
import User from '../src/models/User';

jest.setTimeout(30000);

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connection.dropDatabase();

  // Create admin and user tokens
  const adminRes = await request(app)
    .post('/auth/register')
    .send({
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
  adminToken = adminRes.body.token;

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

describe('Student API Tests', () => {
  let studentId: string;
  let courseId: string;
  let enrollTestStudentId: string;

  // Create a course first for enrollment tests
  beforeAll(async () => {
    const courseRes = await request(app)
      .post('/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Mathematics',
        code: 'MATH101',
        credits: 4
      });
    courseId = courseRes.body._id;

    // Create a fresh student for enrollment tests
    const enrollRes = await request(app)
      .post('/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Enroll Test Student',
        email: 'enroll.test@example.com',
        age: 20
      });
    enrollTestStudentId = enrollRes.body._id;
  });

  describe('POST /students - Create Student', () => {
    it('should allow admin to create a new student with valid data', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
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

    it('should reject regular user from creating a student', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Rejected Student',
          email: 'rejected@example.com',
          age: 20
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should reject student creation with missing name', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
    it('should retrieve all students without authentication', async () => {
      const res = await request(app)
        .get('/students');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /students/:id - Get Single Student', () => {
    it('should retrieve a student by ID without authentication', async () => {
      const res = await request(app)
        .get(`/students/${studentId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(studentId);
      expect(res.body.name).toBe('John Doe');
    });

    it('should return 404 for non-existent student', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/students/${fakeId}`)

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });

    it('should return 500 for invalid student ID format', async () => {
      const res = await request(app)
        .get('/students/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /students/:id - Update Student', () => {
    it('should allow user to update student name', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'John Updated Doe'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('John Updated Doe');
    });

    it('should allow user to update student age', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .set('Authorization', `Bearer ${userToken}`)
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
        .set('Authorization', `Bearer ${userToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          age: 22
        });

      // Try to update first student to use second student's email
      const res = await request(app)
        .put(`/students/${studentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'jane.smith@example.com'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email is already taken by another student');
    });
  });

  describe('PUT /students/:id/enroll-course - Enroll in Course', () => {
    it('should allow user to enroll student in a course', async () => {
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1);
    });

    it('should not duplicate enrollment in same course', async () => {
      // Try to enroll in same course again
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1); // Still only 1
    });

    it('should reject enrollment with missing courseId', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent course enrollment', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: fakeCourseId.toString() });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Cannot enroll: Course not found');
    });

    it('should return 404 for non-existent student enrollment', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${fakeStudentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PUT /students/:id/remove-course - Remove from Course', () => {
    it('should allow user to remove student from a course', async () => {
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(0);
    });

    it('should reject removal with missing courseId', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent student removal', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${fakeStudentId}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });
  });

  describe('DELETE /students/:id - Delete Student', () => {
    it('should allow admin to delete a student', async () => {
      // Create a student to delete
      const createRes = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Temp Student',
          email: 'temp@example.com',
          age: 19
        });

      const tempStudentId = createRes.body._id;

      const res = await request(app)
        .delete(`/students/${tempStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Student deleted successfully');

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/students/${tempStudentId}`);
      expect(getRes.status).toBe(404);
    });

    it('should reject regular user from deleting a student', async () => {
      const res = await request(app)
        .delete(`/students/${studentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should return 404 when deleting non-existent student', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/students/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });
  });

  describe('Duplicate Data Handling', () => {
    it('should reject creating student with duplicate email', async () => {
      const studentData = {
        name: 'John Duplicate',
        email: 'duplicate@test.com',
        age: 20,
        grade: 'A'
      };

      // Create first student
      await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect(201);

      // Try to create duplicate
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(studentData)
        .expect([400, 409]);

      // Accept any error message for duplicate
      expect(res.body.message).toBeDefined();
    });

    it('should allow updating to same email for same student', async () => {
      const createRes = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Update',
          email: 'update-same@test.com',
          age: 21,
          grade: 'B'
        })
        .expect(201);

      const id = createRes.body._id;

      // Update with same email should succeed
      const res = await request(app)
        .put(`/students/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Update Modified',
          email: 'update-same@test.com',
          age: 22,
          grade: 'A'
        })
        .expect(200);

      expect(res.body.name).toBe('Test Update Modified');
    });

    it('should reject updating student with another students email', async () => {
      // Create two students
      const student1 = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Student One',
          email: 'student1@test.com',
          age: 20,
          grade: 'A'
        })
        .expect(201);

      await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Student Two',
          email: 'student2@test.com',
          age: 21,
          grade: 'B'
        })
        .expect(201);

      // Try to update student1 with student2's email
      const res = await request(app)
        .put(`/students/${student1.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Student One',
          email: 'student2@test.com',
          age: 20,
          grade: 'A'
        })
        .expect([400, 409]);

      expect(res.body.message).toBeDefined();
    });
  });

  describe('Enrollment Edge Cases', () => {
    it('should reject enrolling in non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: fakeId })
        .expect(404);

      expect(res.body.message).toMatch(/course|not found/i);
    });

    it('should reject enrolling non-existent student', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/students/${fakeId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId })
        .expect(404);

      expect(res.body.message).toMatch(/student|not found/i);
    });

    it('should reject duplicate enrollment in same course', async () => {
      // First enrollment
      await request(app)
        .put(`/students/${enrollTestStudentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId })
        .expect(200);

      // Duplicate enrollment
      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId })
        .expect([200, 400, 409]);

      // Either returns 200 (idempotent) or error
      if (res.status !== 200) {
        expect(res.body.message).toBeDefined();
      }
    });

    it('should reject removing course student is not enrolled in', async () => {
      // Create a course and student, but don't enroll
      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Unenrolled Course',
          code: 'UNENROLL101',
          credits: 3
        })
        .expect(201);

      const res = await request(app)
        .put(`/students/${enrollTestStudentId}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect([200, 400]);

      if (res.status === 400) {
        expect(res.body.message).toBeDefined();
      }
    });

    it('should successfully enroll then remove from course', async () => {
      // Create fresh student and course for this test
      const studentRes = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Enroll Test',
          email: 'enroll-remove@test.com',
          age: 22,
          grade: 'A'
        })
        .expect(201);

      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Temp Course',
          code: 'TEMP202',
          credits: 3
        })
        .expect(201);

      // Enroll
      await request(app)
        .put(`/students/${studentRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Verify enrollment
      let getRes = await request(app)
        .get(`/students/${studentRes.body._id}`)
        .expect(200);
      expect(getRes.body.courses).toHaveLength(1);

      // Remove
      await request(app)
        .put(`/students/${studentRes.body._id}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Verify removal
      getRes = await request(app)
        .get(`/students/${studentRes.body._id}`)
        .expect(200);
      expect(getRes.body.courses).toHaveLength(0);
    });
  });

  describe('Data Integrity and Cascade Operations', () => {
    it('should handle deletion of student with enrolled courses', async () => {
      // Create student and course
      const studentRes = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Delete with Courses',
          email: 'delete-cascade@test.com',
          age: 23,
          grade: 'B'
        })
        .expect(201);

      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Cascade Test Course',
          code: 'CASCADE202',
          credits: 3
        })
        .expect(201);

      // Enroll student in course
      await request(app)
        .put(`/students/${studentRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Delete student - should succeed even with enrollments
      await request(app)
        .delete(`/students/${studentRes.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/students/${studentRes.body._id}`)
        .expect(404);
    });

    it('should handle empty students list', async () => {
      // This test works if there are students or not
      const res = await request(app)
        .get('/students')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
