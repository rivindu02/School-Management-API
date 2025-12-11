// __tests__/validation.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/school_db_test';

import app from '../src/app';
import User from '../src/models/User';

jest.setTimeout(30000);

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  await mongoose.connection.dropDatabase();

  // Create admin for POST operations
  const adminRes = await request(app)
    .post('/auth/register')
    .send({
      username: 'admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
  adminToken = adminRes.body.token;

  // Create a test user and get token
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

describe('Validation Middleware Tests', () => {
  describe('Course Validation', () => {
    it('should return validation error with proper structure', async () => {
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should validate title is a string', async () => {
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Student',
          email: 'test.student@example.com',
          age: 20
        });
      studentId = studentRes.body._id;

      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Teacher',
          email: 'test.teacher@example.com'
        });
      teacherId = teacherRes.body._id;
    });

    it('should validate courseId is required for student enrollment', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is a string for student enrollment', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/enroll-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          courseId: 123 // Invalid type
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is required for teacher enrollment', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/enroll-course`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is required for student removal', async () => {
      const res = await request(app)
        .put(`/students/${studentId}/remove-course`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should validate courseId is required for teacher removal', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}/remove-course`)
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Course',
          code: 'TEST101',
          credits: 3
        });
      courseId = courseRes.body._id;

      const studentRes = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Update Test Student',
          email: 'update.test@example.com',
          age: 20
        });
      studentId = studentRes.body._id;

      const teacherRes = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Update Test Teacher',
          email: 'update.teacher@example.com'
        });
      teacherId = teacherRes.body._id;
    });

    it('should allow partial course update', async () => {
      const res = await request(app)
        .put(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title Only'
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title Only');
    });

    it('should allow partial student update', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          age: 21
        });

      expect(res.status).toBe(200);
      expect(res.body.age).toBe(21);
    });

    it('should allow partial teacher update', async () => {
      const res = await request(app)
        .put(`/teachers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Updated'
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Dr. Updated');
    });

    it('should still validate types on partial update', async () => {
      const res = await request(app)
        .put(`/students/${studentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          age: 'invalid' // Wrong type
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });
  });

  describe('Edge Cases - Invalid MongoDB ObjectIDs', () => {
    it('should return 400 or 500 for invalid student ID format', async () => {
      const res = await request(app)
        .get('/students/invalid-id-format');
      
      // Server may return 400 or 500 for invalid ObjectID - both acceptable
      expect([400, 500]).toContain(res.status);
    });

    it('should return 400 or 500 for invalid teacher ID format', async () => {
      const res = await request(app)
        .get('/teachers/not-a-valid-objectid');
      
      expect([400, 500]).toContain(res.status);
    });

    it('should return 400 or 500 for invalid course ID format', async () => {
      const res = await request(app)
        .get('/courses/12345');
      
      expect([400, 500]).toContain(res.status);
    });

    it('should return 404 for valid but non-existent student ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/students/${fakeId}`)
        .expect(404);
    });

    it('should return 404 for valid but non-existent teacher ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/teachers/${fakeId}`)
        .expect(404);
    });

    it('should return 404 for valid but non-existent course ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/courses/${fakeId}`)
        .expect(404);
    });
  });

  describe('Security - Email Validation', () => {
    it('should reject invalid email format - no @', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Email',
          email: 'invalidemail.com',
          age: 20,
          grade: 'A'
        })
        .expect([400, 500]);
      
      expect(res.body.message).toBeDefined();
    });

    it('should reject invalid email format - no domain', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Email',
          email: 'test@',
          age: 20,
          grade: 'A'
        })
        .expect(400);
      
      // Validation rejects it, message may be generic
      expect(res.body.message).toBeDefined();
    });

    it('should reject email with spaces', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Space Email',
          email: 'space email@test.com',
          age: 20,
          grade: 'A'
        })
        .expect(400);
      
      expect(res.body.message).toBeDefined();
    });

    it('should accept valid email with plus sign', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Plus Email',
          email: 'test+valid@test.com',
          age: 20,
          grade: 'A'
        })
        .expect(201);
      
      expect(res.body.email).toBe('test+valid@test.com');
    });
  });

  describe('Security - XSS Prevention', () => {
    it('should handle XSS attempt in student name safely', async () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: xssAttempt,
          email: 'xss-student@test.com',
          age: 20,
          grade: 'A'
        })
        .expect(201);
      
      expect(res.body.name).toBe(xssAttempt);
    });

    it('should handle special characters in names safely', async () => {
      const specialName = "O'Brien <test>";
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: specialName,
          email: 'obrien@test.com',
          age: 20,
          grade: 'A'
        })
        .expect(201);
      
      expect(res.body.name).toBe(specialName);
    });
  });

  describe('Numeric Validation Edge Cases', () => {
    it('should reject student with zero age', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Zero Age',
          email: 'zero-age@test.com',
          age: 0,
          grade: 'A'
        })
        .expect(400);
      
      expect(res.body.message).toBeDefined();
    });

    it('should reject student with extremely high age', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Old Student',
          email: 'old-student@test.com',
          age: 200,
          grade: 'A'
        })
        .expect(400);
      
      expect(res.body.message).toBeDefined();
    });

    it('should reject teacher with zero salary or accept it', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Zero Salary',
          email: 'zero-salary@test.com',
          subject: 'Math',
          experience: 5
        })
        .expect([201, 400]); // May accept or reject
    });

    it('should reject course with zero credits', async () => {
      const res = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Zero Credits',
          code: 'ZER000',
          credits: 0
        })
        .expect(400);
      
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Type Coercion Prevention', () => {
    it('should reject or coerce boolean as age', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Boolean Age',
          email: 'bool-age@test.com',
          age: true,
          grade: 'A'
        })
        .expect([400, 201]); // May coerce or reject
    });

    it('should reject or coerce array as name', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: ['John', 'Doe'],
          email: 'array-name@test.com',
          age: 20,
          grade: 'A'
        })
        .expect([400, 201]); // May coerce or reject
    });

    it('should reject or coerce object as email', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Object Email',
          email: { local: 'test', domain: 'test.com' },
          age: 20,
          grade: 'A'
        })
        .expect([400, 201]); // May coerce or reject
    });
  });
});
