import { body } from 'express-validator';

export const createParkingValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Parking name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('locality')
    .trim()
    .notEmpty()
    .withMessage('Locality is required'),
  body('category')
    .optional()
    .isIn(['PUBLIC', 'PRIVATE', 'COMMERCIAL', 'GOVERNMENT', 'GHMC', 'TRANSPORT', 'OTHER'])
    .withMessage('Invalid category'),
  body('publicAccess')
    .optional()
    .isIn(['PUBLIC', 'CUSTOMERS_ONLY', 'STAFF_ONLY', 'PERMIT_REQUIRED', 'RESTRICTED', 'UNKNOWN'])
    .withMessage('Invalid public access type'),
  body('pricingModel')
    .optional()
    .isIn(['FREE', 'PAID', 'VARIABLE', 'UNKNOWN'])
    .withMessage('Invalid pricing model')
];

export const updateAvailabilityValidator = [
  body('twoWheelerSlots')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Two wheeler slots must be a non-negative integer'),
  body('fourWheelerSlots')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Four wheeler slots must be a non-negative integer'),
  body('totalSlots')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total slots must be a non-negative integer'),
  body('operationalStatus')
    .optional()
    .isIn(['OPEN', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED', 'UNKNOWN'])
    .withMessage('Invalid operational status')
];
