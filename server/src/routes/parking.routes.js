import { Router } from 'express';
import {
  getParkings,
  getNearbyParkings,
  getParkingById,
  createParking,
  updateParking,
  getAvailability,
  submitReport
} from '../controllers/parking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { createParkingValidator } from '../validators/parking.validator.js';
import { createReportValidator } from '../validators/report.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { reportLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.get('/', getParkings);
router.get('/nearby', getNearbyParkings);
router.get('/:id', getParkingById);
router.get('/:id/availability', getAvailability);

router.post(
  '/',
  authenticate,
  requireRole('OWNER', 'ADMIN'),
  createParkingValidator,
  validate,
  createParking
);

router.patch(
  '/:id',
  authenticate,
  requireRole('OWNER', 'ADMIN'),
  updateParking
);

router.post(
  '/:id/report',
  authenticate,
  reportLimiter,
  createReportValidator,
  validate,
  submitReport
);

export default router;
