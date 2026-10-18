import { body } from 'express-validator';

export const createBookingValidator = [
  body('parkingId')
    .notEmpty()
    .withMessage('Parking ID is required')
    .isMongoId()
    .withMessage('Invalid parking ID format'),
  body('vehicleType')
    .isIn(['TWO_WHEELER', 'FOUR_WHEELER', 'OTHER'])
    .withMessage('Vehicle type must be TWO_WHEELER, FOUR_WHEELER, or OTHER'),
  body('vehicleNumber')
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Invalid vehicle registration number'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date')
];

export const cancelBookingValidator = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Cancellation reason cannot exceed 250 characters')
];

export const validateQrValidator = [
  body('tokenOrRef')
    .trim()
    .notEmpty()
    .withMessage('QR token or Booking reference is required')
];
