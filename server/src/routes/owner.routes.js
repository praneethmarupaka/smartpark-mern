import { Router } from 'express';
import {
  getOwnerDashboard,
  getMyParkings,
  updateAvailability,
  getOwnerBookings,
  getOwnerAnalytics
} from '../controllers/owner.controller.js';
import { checkIn, checkOut } from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { updateAvailabilityValidator } from '../validators/parking.validator.js';
import { validateQrValidator } from '../validators/booking.validator.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Protect all owner routes
router.use(authenticate, requireRole('OWNER', 'ADMIN'));

router.get('/dashboard', getOwnerDashboard);
router.get('/parking', getMyParkings);
router.patch('/parking/:id/availability', updateAvailabilityValidator, validate, updateAvailability);
router.get('/bookings', getOwnerBookings);
router.post('/validate-qr', validateQrValidator, validate, checkIn);
router.post('/checkout-qr', validateQrValidator, validate, checkOut);
router.get('/analytics', getOwnerAnalytics);

export default router;
