import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.model.js';
import { Parking } from '../src/models/Parking.model.js';
import { Booking } from '../src/models/Booking.model.js';

describe('Booking & Concurrency Lifecycle API Tests', () => {
  let userToken;
  let ownerToken;
  let testUser;
  let testOwner;
  let bookingSupportedParking;
  let noBookingParking;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    testUser = await User.findOne({ role: 'USER' });
    testOwner = await User.findOne({ role: 'OWNER' });
    bookingSupportedParking = await Parking.findOne({ bookingSupported: true, operationalStatus: 'OPEN' });
    noBookingParking = await Parking.findOne({ bookingSupported: false });

    userToken = jwt.sign({ id: testUser._id, role: 'USER' }, env.JWT_SECRET, { expiresIn: '1h' });
    ownerToken = jwt.sign({ id: testOwner._id, role: 'OWNER' }, env.JWT_SECRET, { expiresIn: '1h' });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  test('POST /api/bookings - rejects start time in the past', async () => {
    const pastStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        parkingId: bookingSupportedParking._id,
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09TEST01',
        startTime: pastStart,
        endTime: futureEnd
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /past/i);
  });

  test('POST /api/bookings - rejects end time before or equal to start time', async () => {
    const futureTime = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        parkingId: bookingSupportedParking._id,
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09TEST01',
        startTime: futureTime,
        endTime: futureTime
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /after/i);
  });

  test('POST /api/bookings - rejects facility when booking is not supported', async () => {
    if (!noBookingParking) return;

    const start = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        parkingId: noBookingParking._id,
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09TEST01',
        startTime: start,
        endTime: end
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /does not support/i);
  });

  test('POST /api/bookings - creates confirmed reservation with secure QR payload', async () => {
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        parkingId: bookingSupportedParking._id,
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09TEST99',
        startTime: start,
        endTime: end
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.booking.bookingReference);
    assert.ok(res.body.data.booking.qrToken);
    assert.ok(res.body.data.booking.qrDataUrl);
    assert.equal(res.body.data.booking.bookingStatus, 'CONFIRMED');

    // Cancel this created test booking
    const bookingId = res.body.data.booking._id;
    const cancelRes = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'Test complete' });

    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.data.booking.bookingStatus, 'CANCELLED');
  });
});
