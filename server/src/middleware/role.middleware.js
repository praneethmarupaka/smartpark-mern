import { ApiResponse } from '../utils/apiResponse.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden. Access requires one of the following roles: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};
