import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.model.js';

describe('Authentication & Security API Tests', () => {
  const testEmail = 'auth_test_admin@smartpark.org';
  const testPassword = 'TestPassword123#';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
    // Ensure test user exists
    await User.deleteMany({ email: testEmail });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);
    await User.create({
      name: 'Auth Test Admin',
      email: testEmail,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    });
  });

  after(async () => {
    await User.deleteMany({ email: testEmail });
    await mongoose.connection.close();
  });

  test('POST /api/auth/login - valid credentials returns token and user without passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.role, 'ADMIN');
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  test('POST /api/auth/login - invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register - prevents role escalation to ADMIN', async () => {
    const randomEmail = `test_hacker_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker Joe',
        email: randomEmail,
        password: 'Password123!',
        role: 'ADMIN'
      });

    assert.equal(res.status, 400); // Express validator catches invalid role
  });

  test('GET /api/auth/me - requires valid JWT Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('GET /api/health - returns healthy status and service info', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });
});
