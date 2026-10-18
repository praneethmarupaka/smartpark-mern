import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkIn,
  checkOut
} from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createBookingValidator,
  cancelBookingValidator,
  validateQrValidator
} from '../validators/booking.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { bookingLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  bookingLimiter,
  createBookingValidator,
  validate,
  createBooking
);

router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/cancel', authenticate, cancelBookingValidator, validate, cancelBooking);

router.post(
  '/:id/check-in',
  authenticate,
  requireRole('OWNER', 'ADMIN'),
  checkIn
);

router.post(
  '/:id/check-out',
  authenticate,
  requireRole('OWNER', 'ADMIN'),
  checkOut
);

export default router;
