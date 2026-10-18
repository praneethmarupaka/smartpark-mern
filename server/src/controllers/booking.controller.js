import { Booking } from '../models/Booking.model.js';
import { BookingService } from '../services/booking.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createBooking = async (req, res, next) => {
  try {
    const { parkingId, vehicleType, vehicleNumber, startTime, endTime } = req.body;

    const booking = await BookingService.createBooking({
      userId: req.user._id,
      parkingId,
      vehicleType,
      vehicleNumber,
      startTime,
      endTime
    });

    const populatedBooking = await Booking.findById(booking._id).populate('parkingId');

    return ApiResponse.created(
      res,
      { booking: populatedBooking },
      'Parking reservation confirmed successfully'
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (status) {
      query.bookingStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('parkingId', 'name address locality city category pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query)
    ]);

    return ApiResponse.paginated(
      res,
      bookings,
      { page: pageNum, limit: limitNum, total },
      'User bookings retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return ApiResponse.error(res, 'Booking not found', 404);
    }

    const isUserOwner = booking.userId._id.toString() === req.user._id.toString();
    const isFacilityOwner =
      req.user.role === 'OWNER' &&
      booking.parkingId.createdBy &&
      booking.parkingId.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isUserOwner && !isFacilityOwner && !isAdmin) {
      return ApiResponse.error(res, 'Unauthorized to view this booking', 403);
    }

    return ApiResponse.success(res, { booking }, 'Booking details retrieved');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await BookingService.cancelBooking({
      bookingId: req.params.id,
      userId: req.user.role === 'ADMIN' ? null : req.user._id,
      reason
    });

    return ApiResponse.success(res, { booking }, 'Booking successfully cancelled');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const { tokenOrRef } = req.body;
    const booking = await BookingService.checkInBooking({
      tokenOrRef: tokenOrRef || req.params.id,
      ownerId: req.user.role === 'ADMIN' ? null : req.user._id
    });

    return ApiResponse.success(res, { booking }, 'Check-in validated successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const { tokenOrRef } = req.body;
    const booking = await BookingService.checkOutBooking({
      tokenOrRef: tokenOrRef || req.params.id,
      ownerId: req.user.role === 'ADMIN' ? null : req.user._id
    });

    return ApiResponse.success(res, { booking }, 'Check-out completed successfully');
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};
