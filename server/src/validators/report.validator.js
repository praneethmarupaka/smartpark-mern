import { body } from 'express-validator';

export const createReportValidator = [
  body('issueType')
    .isIn([
      'INCORRECT_LOCATION',
      'DUPLICATE_RECORD',
      'CLOSED_FACILITY',
      'INCORRECT_PRICE',
      'INCORRECT_ACCESS_RESTRICTION',
      'MISLEADING_AVAILABILITY',
      'INACCESSIBLE_PARKING',
      'OTHER'
    ])
    .withMessage('Invalid issue type'),
  body('explanation')
    .trim()
    .notEmpty()
    .withMessage('Explanation is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Explanation must be between 10 and 1000 characters')
];
