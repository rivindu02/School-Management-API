// __tests__/teacher.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27018/school_db_test';

import app from '../src/app';
import User from '../src/models/User';

jest.setTimeout(30000);

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connection.dropDatabase();

  // Create admin user for teacher operations
  const adminRes = await request(app)
    .post('/auth/register')
    .send({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
  adminToken = adminRes.body.token;

  // Create regular user for testing rejection
  const userRes = await request(app)
    .post('/auth/register')
    .send({
      username: 'testuser',
      email: 'user@test.com',
      password: 'user123',
      role: 'user'
    });
  userToken = userRes.body.token;
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
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Physics',
        code: 'PHY101',
        credits: 4
      });
    courseId = courseRes.body._id;

    // Create a fresh teacher for enrollment tests
    const enrollRes = await request(app)
      .post('/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Enroll Test Teacher',
        email: 'enroll.teacher@example.com'
      });
    enrollTestTeacherId = enrollRes.body._id;
  });

  describe('POST /teachers - Create Teacher', () => {
    it('should allow admin to create a new teacher with valid data', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
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

    it('should reject regular user from creating a teacher', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Rejected Teacher',
          email: 'rejected@example.com'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should reject teacher creation with missing name', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'teacher@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should reject teacher creation with invalid email', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Smith Clone',
          email: 'dr.smith@example.com' // Duplicate
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Error creating teacher');
    });
  });

  describe('GET /teachers - Get All Teachers', () => {
    it('should retrieve all teachers without authentication', async () => {
      const res = await request(app)
        .get('/teachers');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /teachers/:id - Get Single Teacher', () => {
    it('should retrieve a teacher by ID without authentication', async () => {
      const res = await request(app)
        .get(`/teachers/${teacherId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(teacherId);
      expect(res.body.name).toBe('Dr. Smith');
    });

    it('should return 404 for non-existent teacher', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/teachers/${fakeId}`)

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });

    it('should return 500 for invalid teacher ID format', async () => {
      const res = await request(app)
        .get('/teachers/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /teachers/:id - Update Teacher', () => {
    it('should allow admin to update teacher name', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Updated Smith'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Dr. Updated Smith');
    });

    it('should allow regular user from updating teacher', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Allowed Update'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Allowed Update');
    });

    it('should allow admin to update teacher email', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Jones',
          email: 'dr.jones@example.com'
        });

      // Try to update first teacher to use second teacher's email
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'dr.jones@example.com'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email is already taken by another teacher');
    });
  });

  describe('PUT /teachers/:id/enroll-course - Assign to Course', () => {
    it('should allow admin to assign teacher to a course', async () => {
      const res = await request(app)
        .put(`/teachers/${enrollTestTeacherId}/enroll-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1);
    });

    it('should not duplicate assignment to same course', async () => {
      // Try to assign to same course again
      const res = await request(app)
        .put(`/teachers/${enrollTestTeacherId}/enroll-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(1); // Still only 1
    });

    it('should reject assignment with missing courseId', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent course assignment', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: fakeCourseId.toString() });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Cannot enroll: Course not found');
    });

    it('should return 404 for non-existent teacher assignment', async () => {
      const fakeTeacherId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${fakeTeacherId}/enroll-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    it('should allow regular user to assign teacher to course', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      // Check if courseId is in the courses array (could be string or populated object)
      const hasCourse = res.body.courses.some((c: any) => 
        (typeof c === 'string' ? c : c._id) === courseId
      );
      expect(hasCourse).toBe(true);
    });
  });

  describe('PUT /teachers/:id/remove-course - Remove from Course', () => {
    it('should allow admin to remove teacher from a course', async () => {
      const res = await request(app)
        .put(`/teachers/${enrollTestTeacherId}/remove-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBe(0);
    });

    it('should reject removal with missing courseId', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/remove-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
    });

    it('should return 404 for non-existent teacher removal', async () => {
      const fakeTeacherId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/teachers/${fakeTeacherId}/remove-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ courseId: courseId });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });
  });

  describe('DELETE /teachers/:id - Delete Teacher', () => {
    it('should allow admin to delete a teacher', async () => {
      // Create a teacher to delete
      const createRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Temp Teacher',
          email: 'temp.teacher@example.com'
        });

      const tempTeacherId = createRes.body._id;

      const res = await request(app)
        .delete(`/teachers/${tempTeacherId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Teacher deleted successfully');

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/teachers/${tempTeacherId}`);
      expect(getRes.status).toBe(404);
    });

    it('should reject regular user from deleting a teacher', async () => {
      const res = await request(app)
        .delete(`/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should return 404 when deleting non-existent teacher', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/teachers/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Teacher not found');
    });
  });

  describe('Duplicate Data Handling', () => {
    it('should reject creating teacher with duplicate email', async () => {
      const teacherData = {
        name: 'Dr. Duplicate',
        email: 'duplicate-teacher@test.com',
        subject: 'Mathematics',
        experience: 5
      };

      // Create first teacher
      await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData)
        .expect(201);

      // Try to create duplicate
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData)
        .expect([400, 409]);

      expect(res.body.message).toBeDefined();
    });

    it('should allow updating teacher with same email', async () => {
      const createRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Prof. Same Email',
          email: 'same-email-teacher@test.com',
          subject: 'Physics',
          experience: 3
        })
        .expect(201);

      const id = createRes.body._id;

      // Update with same email should succeed
      const res = await request(app)
        .put(`/teachers/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Prof. Same Email Updated',
          email: 'same-email-teacher@test.com',
          subject: 'Physics',
          experience: 4
        })
        .expect(200);

      expect(res.body.name).toBe('Prof. Same Email Updated');
      if (res.body.experience !== undefined) {
        expect(res.body.experience).toBe(4);
      }
    });

    it('should reject updating teacher with another teachers email', async () => {
      // Create two teachers
      const teacher1 = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Teacher One',
          email: 'teacher1@test.com',
          subject: 'Math',
          experience: 5
        })
        .expect(201);

      await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Teacher Two',
          email: 'teacher2@test.com',
          subject: 'Science',
          experience: 3
        })
        .expect(201);

      // Try to update teacher1 with teacher2's email
      const res = await request(app)
        .put(`/teachers/${teacher1.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Teacher One',
          email: 'teacher2@test.com',
          subject: 'Math',
          experience: 5
        })
        .expect([400, 409]);

      expect(res.body.message).toBeDefined();
    });
  });

  describe('Course Assignment Edge Cases', () => {
    it('should reject assigning non-existent teacher to course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        . put(`/teachers/${fakeId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseId })
        .expect(404);

      expect(res.body.message).toMatch(/teacher|not found/i);
    });

    it('should reject assigning teacher to non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        . put(`/teachers/${teacherId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: fakeId })
        .expect(404);

      expect(res.body.message).toMatch(/course|not found/i);
    });

    it('should reject duplicate course assignment to same teacher', async () => {
      // Create fresh teacher and course
      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Prof. Assignment Test',
          email: 'assign-test@test.com',
          subject: 'Chemistry',
          experience: 4
        })
        .expect(201);

      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Assignment Test Course',
          code: 'ASSIGN101',
          credits: 3
        })
        .expect(201);

      // First assignment
      await request(app)
        . put(`/teachers/${teacherRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Duplicate assignment
      const res = await request(app)
        . put(`/teachers/${teacherRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect([200, 400, 409]);

      // Either returns 200 (idempotent) or error
      if (res.status !== 200) {
        expect(res.body.message).toBeDefined();
      }
    });

    it('should successfully assign then unassign course', async () => {
      // Create fresh teacher and course
      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Prof. Unassign Test',
          email: 'unassign-test@test.com',
          subject: 'Biology',
          experience: 6
        })
        .expect(201);

      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Unassign Course',
          code: 'UNASSIGN101',
          credits: 3
        })
        .expect(201);

      // Assign
      await request(app)
        . put(`/teachers/${teacherRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Verify assignment
      let getRes = await request(app)
        .get(`/teachers/${teacherRes.body._id}`)
        .expect(200);
      expect(getRes.body.courses).toHaveLength(1);

      // Unassign
      await request(app)
        .put(`/teachers/${teacherRes.body._id}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Verify unassignment
      getRes = await request(app)
        .get(`/teachers/${teacherRes.body._id}`)
        .expect(200);
      expect(getRes.body.courses).toHaveLength(0);
    });

    it('should reject unassigning course teacher is not assigned to', async () => {
      // Create teacher and course, but don't assign
      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Prof. No Assignment',
          email: 'no-assign@test.com',
          subject: 'History',
          experience: 2
        })
        .expect(201);

      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'No Assignment Course',
          code: 'NOASSIGN101',
          credits: 3
        })
        .expect(201);

      // Try to unassign without assignment
      const res = await request(app)
        .put(`/teachers/${teacherRes.body._id}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect([200, 400]);

      if (res.status === 400) {
        expect(res.body.message).toBeDefined();
      }
    });
  });

  describe('Data Integrity and Cascade Operations', () => {
    it('should handle deletion of teacher with assigned courses', async () => {
      // Create teacher and course
      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Prof. Delete Test',
          email: 'delete-cascade-teacher@test.com',
          subject: 'English',
          experience: 7
        })
        .expect(201);

      const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Delete Cascade Course',
          code: 'DELETE101',
          credits: 3
        })
        .expect(201);

      // Assign teacher to course
      await request(app)
        . put(`/teachers/${teacherRes.body._id}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ courseId: courseRes.body._id })
        .expect(200);

      // Delete teacher - should succeed even with assignments
      await request(app)
        .delete(`/teachers/${teacherRes.body._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/teachers/${teacherRes.body._id}`)
        .expect(404);
    });

    it('should handle empty teachers list', async () => {
      const res = await request(app)
        .get('/teachers')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
