import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.model.js';
import { Parking } from '../src/models/Parking.model.js';

describe('Admin Verification & Governance API Tests', () => {
  let adminToken;
  let userToken;
  let testAdmin;
  let testUser;
  let pendingParking;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    testAdmin = await User.findOne({ role: 'ADMIN' });
    testUser = await User.findOne({ role: 'USER' });

    adminToken = jwt.sign({ id: testAdmin._id, role: 'ADMIN' }, env.JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: testUser._id, role: 'USER' }, env.JWT_SECRET, { expiresIn: '1h' });

    pendingParking = await Parking.findOne({ verificationStatus: 'PENDING' });
    if (!pendingParking) {
      pendingParking = await Parking.create({
        name: 'Test Pending Lot',
        address: 'Test Address',
        locality: 'Gachibowli',
        category: 'COMMERCIAL',
        verificationStatus: 'PENDING',
        operationalStatus: 'OPEN'
      });
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/admin/dashboard - rejects unauthorized non-admin request with 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  test('GET /api/admin/dashboard - returns platform statistics for administrator', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(typeof res.body.data.totalParkings === 'number');
    assert.ok(typeof res.body.data.verifiedParkings === 'number');
    assert.ok(typeof res.body.data.pendingParkings === 'number');
  });

  test('PATCH /api/admin/parking/:id/verification - requires reason when rejecting', async () => {
    const res = await request(app)
      .patch(`/api/admin/parking/${pendingParking._id}/verification`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'REJECTED'
        // Missing notes or rejectionReason
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('PATCH /api/admin/parking/:id/verification - successfully verifies parking record', async () => {
    const res = await request(app)
      .patch(`/api/admin/parking/${pendingParking._id}/verification`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'VERIFIED',
        notes: 'Physical site verified by GHMC inspector'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.parking.verificationStatus, 'VERIFIED');
    assert.ok(res.body.data.parking.verifiedBy);
    assert.ok(res.body.data.parking.verifiedAt);
  });

  test('GET /api/admin/coverage - returns detailed coverage audit data', async () => {
    const res = await request(app)
      .get('/api/admin/coverage')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(typeof res.body.data.totalRecords === 'number');
    assert.ok(Array.isArray(res.body.data.localityCounts));
    assert.ok(Array.isArray(res.body.data.statusCounts));
    assert.ok(typeof res.body.data.missingCoordinatesCount === 'number');
  });
});
