import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/User';

describe('Authentication System Tests', () => {
  const MONGO_URI = 'mongodb://localhost:27018/school_db_test';
  
  // Store tokens for reuse
  let globalAdminToken: string;
  let globalUserToken: string;

  // 1. Setup: Connect and Seed ONCE
  beforeAll(async () => {
    // Ensure we are disconnected from any previous instances
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(MONGO_URI);

    // Clean the database entirely before starting
    await User.deleteMany({});

    // Register Global Admin
    const adminRes = await request(app)
      .post('/auth/register')
      .send({
        username: 'global_admin',
        email: 'global_admin@test.com',
        password: 'admin123',
        role: 'admin'
      });
    
    // Safety check: if registration fails, stop tests to see why
    if (adminRes.status !== 201) {
      console.error("FATAL: Admin registration failed in beforeAll", adminRes.body);
      throw new Error("Setup failed: Could not register admin");
    }
    globalAdminToken = adminRes.body.token;

    // Register Global User
    const userRes = await request(app)
      .post('/auth/register')
      .send({
        username: 'global_user',
        email: 'global_user@test.com',
        password: 'user123',
        role: 'user'
      });
    globalUserToken = userRes.body.token;
  });

  // 2. Teardown: Disconnect after all tests are done
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'registration_test',
          email: 'reg_test@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('user');
    });
  });

  describe('POST /auth/login', () => {
    // Create a specific user just for login tests
    beforeAll(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          username: 'login_test_user',
          email: 'login_test@test.com',
          password: 'password123'
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login_test@test.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should reject incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login_test@test.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Authorization Tests', () => {
    it('should allow admin to create teacher', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${globalAdminToken}`)
        .send({
          name: 'Dr. Smith',
          email: `smith_${Date.now()}@school.com`
        });

      expect(res.status).toBe(201);
    });

    it('should reject user from creating teacher', async () => {
      const res = await request(app)
        .post('/teachers')
        .set('Authorization', `Bearer ${globalUserToken}`)
        .send({
          name: 'Dr. Jones',
          email: `jones_${Date.now()}@school.com`
        });

      expect(res.status).toBe(403);
    });
  });

  describe('Token Authentication Edge Cases', () => {
    it('should reject request with malformed token', async () => {
      const res = await request(app)
        .post('/students')
        .set('Authorization', 'Bearer invalid-malformed-token')
        .send({ name: 'Test', email: 't@t.com', age: 20 })
        .expect(401);
      
      expect(res.body.message).toMatch(/invalid|token|jwt/i);
    });

    it('should reject token with tampered signature', async () => {
      // Safely check if token exists before slicing
      if (!globalAdminToken) throw new Error("Global Admin Token not set");

      const tamperedToken = globalAdminToken.slice(0, -5) + 'XXXXX';
      
      const res = await request(app)
        .post('/students')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .send({ name: 'Test', email: 't@t.com', age: 20 })
        .expect(401);
      
      expect(res.body.message).toMatch(/invalid|token|signature/i);
    });
  });

  describe('Password Security', () => {
    it('should not return password in user registration response', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'security_check',
          email: 'security@test.com',
          password: 'password123',
          role: 'user'
        })
        .expect(201);
      
      expect(res.body.user.password).toBeUndefined();
    });

    it('should hash password before storing', async () => {
      const plainPassword = 'plaintext123';
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'hashing_test',
          email: 'hash@test.com',
          password: plainPassword,
          role: 'user'
        })
        .expect(201);
      
      const user = await User.findOne({ email: 'hash@test.com' });
      expect(user).toBeDefined();
      expect(user!.password).not.toBe(plainPassword);
    });
  });
});