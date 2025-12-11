// __tests__/full-flow.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

// Set test environment before importing app
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/school_db_test';

import app from '../src/app'; //  index.ts should exports 'app' at the end
import User from '../src/models/User';

// Jest timeout for all tests
jest.setTimeout(30000);

let userToken: string;
let adminToken: string;

// This runs before all tests to connect to the DB
// beforeAll and afterAll are Jest functions that run once before/after all tests
beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI!);
    // Clear the test database before running tests
    await mongoose.connection.dropDatabase();

    // Create admin for creation operations
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

// This runs after all tests to close the connection (prevents hanging)
afterAll(async () => {
    // Drop the test database after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// describe block is a Jest function to group related tests together
//flow: 1. Create Course -> 2. Register Student -> 3. Enroll Student -> 4.Update course content  -> 5. Verify -> 6. Remove Course-> 7. Delete Student

describe('School System API Full Flow', () => {
    let courseId: string;
    let studentId: string;

    // Create course and student before running tests
    beforeAll(async () => {
        // Create course (admin only)
        const courseRes = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Introduction to Robotics',
                code: 'ROBO101',
                credits: 3
            });
        courseId = courseRes.body._id;

        // Create student (admin only)
        const studentRes = await request(app)
            .post('/students')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                age: 22
            });
        studentId = studentRes.body._id;
    });

    // it block is a Jest function to define a single test case

    // 1.
    it('should create a new Course', async () => {
        expect(courseId).toBeDefined();
    });

    // 2.
    it('should register a new Student', async () => {
        expect(studentId).toBeDefined();
    });

    // 3.
    it('should enroll the student in the course', async () => {
        const res = await request(app)
            .put(`/students/${studentId}/enroll-course`)      // ${string variable} is used to insert the studentId into the URL without concatenation
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: courseId });

        expect(res.status).toBe(200); // status 200 means proper update <----- Haven't given like with 201 for creation

        //// Checking if the course ID is in the student's list

        // Note: Because we used .populate()<------------we might get an object or an ID 
        // We check if the array length is 1, if no course was added, length would be 0 bcz array is []
        // here for a example courses : [ { _id: '692f676cebe128b70eacd13b', title: 'DSA', code: 'CS3530', credits: 3, __v: 0 } ]
        expect(res.body.courses.length).toBe(1);
    });

    // 4.
    it('should update the course details', async () => {
        const res = await request(app)
            .put(`/courses/${courseId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            title: 'Intro to Robotics and Automation', // updated title
            credits: 4 // updated credits
            });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Intro to Robotics and Automation');
        expect(res.body.credits).toBe(4);
    });


    // 5.
    it('should retrieve student with course details', async () => {
        const res = await request(app)
            .get('/students');

        // Find our specific student in the list
        const myStudent = res.body.find((s: any) => s._id === studentId);

        expect(myStudent).toBeDefined();


        // Verify the course title is populated (Relationship works!)----------> can be done with code or credits too
        expect(myStudent.courses[0].title).toBe('Intro to Robotics and Automation');
    });

    // 6. 
    it('should remove the course from the student', async () => {
        const res = await request(app)
            .put(`/students/${studentId}/remove-course`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ courseId: courseId });

        expect(res.status).toBe(200);
        expect(res.body.courses.length).toBe(0); // Course array should be empty now
    });
    
    // 7. 
    it('should delete the student', async () => {
        const res = await request(app)
            .delete(`/students/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });
});