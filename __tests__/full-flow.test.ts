// __tests__/full-flow.test.ts
import request from 'supertest';
import mongoose from 'mongoose';

// Set test environment before importing app
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/school_db_test';

import app from '../src/index'; //  index.ts should exports 'app' at the end

// Jest timeout for all tests
jest.setTimeout(30000);

// This runs before all tests to connect to the DB
// beforeAll and afterAll are Jest functions that run once before/after all tests
beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI!);
    // Clear the test database before running tests
    await mongoose.connection.dropDatabase();
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


    // it block is a Jest function to define a single test case

    // 1.
    it('should create a new Course', async () => {
        const res = await request(app)
            .post('/courses')
            .send({
            title: 'Introduction to Robotics',
            code: 'ROBO101',
            credits: 3
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        courseId = res.body._id; // Save ID for later
    });

    // 2.
    it('should register a new Student', async () => {
        const res = await request(app)
            .post('/students')
            .send({
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            age: 22
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        studentId = res.body._id; // Save ID for later
    });

    // 3.
    it('should enroll the student in the course', async () => {
        const res = await request(app)
            .put(`/students/${studentId}/enroll-course`)      // ${string variable} is used to insert the studentId into the URL without concatenation
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
        const res = await request(app).get('/students');

        // Find our specific student in the list
        const myStudent = res.body.find((s: any) => s._id === studentId);

        expect(myStudent).toBeDefined();


        // Verify the course title is populated (Relationship works!)----------> can be done with code or credits too
        expect(myStudent.courses[0].title).toBe('Intro to Robotics and Automation');
    });

    //


    // 6. 
    it('should remove the course from the student', async () => {
        const res = await request(app)
            .put(`/students/${studentId}/remove-course`)
            .send({ courseId: courseId });

        expect(res.status).toBe(200);
        expect(res.body.courses.length).toBe(0); // Course array should be empty now
    });
    
    // 7. 
    it('should delete the student', async () => {
        const res = await request(app).delete(`/students/${studentId}`);
        expect(res.status).toBe(200);
    });
});