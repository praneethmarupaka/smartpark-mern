import { Parking } from '../models/Parking.model.js';
import { Booking } from '../models/Booking.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../services/audit.service.js';

export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const myFacilities = await Parking.find({ createdBy: ownerId });
    const facilityIds = myFacilities.map((f) => f._id);

    const [activeBookingsCount, completedBookingsCount, cancelledBookingsCount, totalRevenueResult] =
      await Promise.all([
        Booking.countDocuments({
          parkingId: { $in: facilityIds },
          bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] }
        }),
        Booking.countDocuments({
          parkingId: { $in: facilityIds },
          bookingStatus: 'COMPLETED'
        }),
        Booking.countDocuments({
          parkingId: { $in: facilityIds },
          bookingStatus: 'CANCELLED'
        }),
        Booking.aggregate([
          {
            $match: {
              parkingId: { $in: facilityIds },
              bookingStatus: 'COMPLETED'
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$priceSnapshot.totalEstimatedAmount' }
            }
          }
        ])
      ]);

    const totalRealRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    return ApiResponse.success(
      res,
      {
        totalFacilities: myFacilities.length,
        verifiedFacilities: myFacilities.filter((f) => f.verificationStatus === 'VERIFIED').length,
        pendingFacilities: myFacilities.filter((f) => f.verificationStatus === 'PENDING').length,
        activeBookings: activeBookingsCount,
        completedBookings: completedBookingsCount,
        cancelledBookings: cancelledBookingsCount,
        totalRealRevenue,
        facilities: myFacilities.slice(0, 5)
      },
      'Owner dashboard stats retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getMyParkings = async (req, res, next) => {
  try {
    const parkings = await Parking.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return ApiResponse.success(res, { parkings }, 'Owner parking facilities retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { twoWheelerSlots, fourWheelerSlots, operationalStatus } = req.body;

    const parking = await Parking.findById(id);
    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    if (parking.createdBy?.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return ApiResponse.error(res, 'Unauthorized to update availability for this facility', 403);
    }

    const previousState = {
      availableSlots: parking.availableSlots,
      operationalStatus: parking.operationalStatus
    };

    if (operationalStatus) {
      parking.operationalStatus = operationalStatus;
    }

    // Capacity validation
    if (twoWheelerSlots !== undefined) {
      const tw = parseInt(twoWheelerSlots);
      if (tw < 0) {
        return ApiResponse.error(res, 'Available two-wheeler slots cannot be negative', 400);
      }
      if (parking.totalCapacity?.twoWheeler && tw > parking.totalCapacity.twoWheeler) {
        return ApiResponse.error(
          res,
          `Available two-wheeler slots (${tw}) cannot exceed total capacity (${parking.totalCapacity.twoWheeler})`,
          400
        );
      }
      parking.availableSlots.twoWheeler = tw;
    }

    if (fourWheelerSlots !== undefined) {
      const fw = parseInt(fourWheelerSlots);
      if (fw < 0) {
        return ApiResponse.error(res, 'Available four-wheeler slots cannot be negative', 400);
      }
      if (parking.totalCapacity?.fourWheeler && fw > parking.totalCapacity.fourWheeler) {
        return ApiResponse.error(
          res,
          `Available four-wheeler slots (${fw}) cannot exceed total capacity (${parking.totalCapacity.fourWheeler})`,
          400
        );
      }
      parking.availableSlots.fourWheeler = fw;
    }

    // Recalculate total available slots
    parking.availableSlots.total =
      (parking.availableSlots.twoWheeler || 0) + (parking.availableSlots.fourWheeler || 0);

    parking.lastAvailabilityUpdate = new Date();
    parking.availabilityUpdatedBy = req.user._id;

    await parking.save();

    await logAuditEvent({
      performedBy: req.user._id,
      action: 'UPDATE_AVAILABILITY',
      targetEntity: 'PARKING',
      targetId: parking._id,
      previousState,
      newState: {
        availableSlots: parking.availableSlots,
        operationalStatus: parking.operationalStatus
      },
      reason: 'Owner updated facility availability and operational status'
    });

    return ApiResponse.success(res, { parking }, 'Parking availability updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getOwnerBookings = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { status, parkingId, page = 1, limit = 20 } = req.query;

    const myFacilities = await Parking.find({ createdBy: ownerId }).select('_id');
    const myFacilityIds = myFacilities.map((f) => f._id);

    const query = {
      parkingId: parkingId ? parkingId : { $in: myFacilityIds }
    };

    if (status) {
      query.bookingStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('parkingId', 'name address locality')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query)
    ]);

    return ApiResponse.paginated(
      res,
      bookings,
      { page: pageNum, limit: limitNum, total },
      'Owner bookings retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const myFacilities = await Parking.find({ createdBy: ownerId }).select('_id');
    const facilityIds = myFacilities.map((f) => f._id);

    const [bookingsByStatus, vehicleDistribution, recentCompletedBookings] = await Promise.all([
      Booking.aggregate([
        { $match: { parkingId: { $in: facilityIds } } },
        { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { parkingId: { $in: facilityIds } } },
        { $group: { _id: '$vehicleType', count: { $sum: 1 } } }
      ]),
      Booking.find({
        parkingId: { $in: facilityIds },
        bookingStatus: 'COMPLETED'
      })
        .select('createdAt priceSnapshot')
        .sort({ createdAt: -1 })
        .limit(30)
    ]);

    return ApiResponse.success(
      res,
      {
        bookingsByStatus,
        vehicleDistribution,
        recentCompletedBookings
      },
      'Owner analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};
