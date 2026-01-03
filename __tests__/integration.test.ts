// __tests__/integration.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27018/school_db_test';

import app from '../src/app';

jest.setTimeout(30000);

let adminToken: string;
let userToken: string;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!);
    await mongoose.connection.dropDatabase();

    // Create admin user
    const adminRes = await request(app)
        .post('/auth/register')
        .send({
            username: 'admin',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin'
        });
    adminToken = adminRes.body.token;

    // Create regular user
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

describe('Complex Multi-Entity Scenarios', () => {
    it('should handle complete school setup with multiple entities', async () => {
        // Create multiple courses with correct field names
        const mathCourse = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Advanced Mathematics',
                code: 'MATH301',
                credits: 3
            })
            .expect(201);

        const physicsCourse = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Physics Fundamentals',
                code: 'PHYS101',
                credits: 4
            })
            .expect(201);

        // Create multiple teachers
        const mathTeacher = await request(app)
            .post('/teachers')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Dr. Mathematics',
                email: 'integ-math-teacher@test.com',
                subject: 'Mathematics',
                experience: 10
            })
            .expect(201);

        const physicsTeacher = await request(app)
            .post('/teachers')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Prof. Physics',
                email: 'integ-physics-teacher@test.com',
                subject: 'Physics',
                experience: 8
            })
            .expect(201);

        // Assign teachers to courses
        await request(app)
            . put(`/teachers/${mathTeacher.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: mathCourse.body._id })
            .expect(200);

        await request(app)
            . put(`/teachers/${physicsTeacher.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: physicsCourse.body._id })
            .expect(200);

        // Create students
        const student1 = await request(app)
            .post('/students')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Alice Johnson',
                email: 'integ-alice@test.com',
                age: 20,
                grade: 'A'
            })
            .expect(201);

        const student2 = await request(app)
            .post('/students')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Bob Smith',
                email: 'integ-bob@test.com',
                age: 21,
                grade: 'B'
            })
            .expect(201);

        // Enroll students in courses
        await request(app)
            .put(`/students/${student1.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: mathCourse.body._id })
            .expect(200);

        await request(app)
            .put(`/students/${student1.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: physicsCourse.body._id })
            .expect(200);

        await request(app)
            .put(`/students/${student2.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: mathCourse.body._id })
            .expect(200);

        // Verify the complete setup
        const mathCourseDetails = await request(app)
            .get(`/courses/${mathCourse.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        const student1Details = await request(app)
            .get(`/students/${student1.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(student1Details.body.courses).toHaveLength(2);
        expect(mathCourseDetails.body).toBeDefined();
    });

    it('should handle cascading operations correctly', async () => {
        // Create a course with teacher and students
        const course = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Cascade Test Course',
                code: 'CASCADE999',
                credits: 3
            })
            .expect(201);

        const teacher = await request(app)
            .post('/teachers')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Prof. Cascade',
                email: 'integ-cascade-prof@test.com',
                subject: 'Testing',
                experience: 5
            })
            .expect(201);

        const student = await request(app)
            .post('/students')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Cascade Student',
                email: 'integ-cascade-student@test.com',
                age: 22,
                grade: 'A'
            })
            .expect(201);

        // Link everything
        await request(app)
            . put(`/teachers/${teacher.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: course.body._id })
            .expect(200);

        await request(app)
            .put(`/students/${student.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: course.body._id })
            .expect(200);

        // Delete the course (cascade should handle relationships)
        await request(app)
            .delete(`/courses/${course.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        // Verify teacher and student still exist
        await request(app)
            .get(`/teachers/${teacher.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        await request(app)
            .get(`/students/${student.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });

    it('should handle cross-entity updates maintaining integrity', async () => {
        // Create initial setup
        const course = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Integrity Test Course',
                code: 'INTEGRITY101',
                credits: 3
            })
            .expect(201);

        const student = await request(app)
            .post('/students')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Integrity Student',
                email: 'integ-integrity-student@test.com',
                age: 20,
                grade: 'A'
            })
            .expect(201);

        // Enroll student
        await request(app)
            .put(`/students/${student.body._id}/enroll-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: course.body._id })
            .expect(200);

        // Update student details
        await request(app)
            .put(`/students/${student.body._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Integrity Student Updated',
                email: 'integ-integrity-student@test.com',
                age: 21,
                grade: 'A+'
            })
            .expect(200);

        // Update course details
        await request(app)
            .put(`/courses/${course.body._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: 'Integrity Test Course Updated',
                code: 'INTEGRITY101',
                credits: 3
            })
            .expect(200);

        // Verify relationships still intact
        const studentDetails = await request(app)
            .get(`/students/${student.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(studentDetails.body.courses).toHaveLength(1);
        expect(studentDetails.body.name).toBe('Integrity Student Updated');
        expect(studentDetails.body.age).toBe(21);
    });

    it('should handle authorization across complex workflows', async () => {
        // User (not admin) tries to create course - should fail
        await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: 'Unauthorized Course',
                code: 'UNAUTH101',
                credits: 3
            })
            .expect(403);

        // Admin creates course - should succeed
        const course = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Authorized Course',
                code: 'AUTH101',
                credits: 3
            })
            .expect(201);

        // User can update course - should succeed
        await request(app)
            .put(`/courses/${course.body._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                title: 'Authorized Course Updated',
                code: 'AUTH101',
                credits: 3
            })
            .expect(200);

        // User tries to delete - should fail
        await request(app)
            .delete(`/courses/${course.body._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);

        // Admin deletes - should succeed
        await request(app)
            .delete(`/courses/${course.body._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });
});
