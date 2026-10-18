import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { Parking } from '../src/models/Parking.model.js';

describe('Parking Discovery & Geospatial Search API Tests', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/parking - returns directory with pagination and proper metadata', async () => {
    const res = await request(app).get('/api/parking?page=1&limit=5');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.limit, 5);
  });

  test('GET /api/parking - filters correctly by category', async () => {
    const res = await request(app).get('/api/parking?category=TRANSPORT');
    assert.equal(res.status, 200);
    for (const item of res.body.data) {
      assert.equal(item.category, 'TRANSPORT');
    }
  });

  test('GET /api/parking - filters verified-only records when requested', async () => {
    const res = await request(app).get('/api/parking?verifiedOnly=true');
    assert.equal(res.status, 200);
    for (const item of res.body.data) {
      assert.equal(item.verificationStatus, 'VERIFIED');
    }
  });

  test('GET /api/parking/nearby - returns geospatial results with recommendations', async () => {
    // Coordinates around Hitec City: lat 17.4475, lng 78.3762
    const res = await request(app).get('/api/parking/nearby?lat=17.4475&lng=78.3762&radiusKm=5');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.results));
    if (res.body.data.results.length > 0) {
      const topResult = res.body.data.results[0];
      assert.ok(topResult.facility);
      assert.ok(typeof topResult.score === 'number');
      assert.ok(Array.isArray(topResult.reasons));
    }
  });

  test('GET /api/parking/nearby - rejects invalid coordinates with 400', async () => {
    const res = await request(app).get('/api/parking/nearby?lat=999&lng=999');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});
