import { Parking } from '../models/Parking.model.js';
import { User } from '../models/User.model.js';
import { Booking } from '../models/Booking.model.js';
import { ParkingReport } from '../models/ParkingReport.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { DataImportJob } from '../models/DataImportJob.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../services/audit.service.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalParkings,
      verifiedParkings,
      pendingParkings,
      unverifiedParkings,
      rejectedParkings,
      totalUsers,
      totalOwners,
      openReports,
      totalBookings
    ] = await Promise.all([
      Parking.countDocuments(),
      Parking.countDocuments({ verificationStatus: 'VERIFIED' }),
      Parking.countDocuments({ verificationStatus: 'PENDING' }),
      Parking.countDocuments({ verificationStatus: 'UNVERIFIED' }),
      Parking.countDocuments({ verificationStatus: 'REJECTED' }),
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'OWNER' }),
      ParkingReport.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
      Booking.countDocuments()
    ]);

    return ApiResponse.success(
      res,
      {
        totalParkings,
        verifiedParkings,
        pendingParkings,
        unverifiedParkings,
        rejectedParkings,
        totalUsers,
        totalOwners,
        openReports,
        totalBookings
      },
      'Admin dashboard statistics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getPendingParkings = async (req, res, next) => {
  try {
    const { status = 'PENDING', page = 1, limit = 20 } = req.query;
    const query = { verificationStatus: status };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [parkings, total] = await Promise.all([
      Parking.find(query)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Parking.countDocuments(query)
    ]);

    return ApiResponse.paginated(
      res,
      parkings,
      { page: pageNum, limit: limitNum, total },
      'Pending verification queue retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const updateVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes = '', rejectionReason = '' } = req.body;

    if (!['VERIFIED', 'REJECTED', 'NEEDS_CORRECTION'].includes(status)) {
      return ApiResponse.error(res, 'Status must be VERIFIED, REJECTED, or NEEDS_CORRECTION', 400);
    }

    if (['REJECTED', 'NEEDS_CORRECTION'].includes(status) && !rejectionReason && !notes) {
      return ApiResponse.error(res, 'A clear reason or notes are required when rejecting or requesting corrections', 400);
    }

    const parking = await Parking.findById(id);
    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    const previousState = {
      verificationStatus: parking.verificationStatus,
      verificationNotes: parking.verificationNotes,
      rejectionReason: parking.rejectionReason
    };

    parking.verificationStatus = status;
    parking.verifiedBy = req.user._id;
    parking.verifiedAt = new Date();
    parking.verificationNotes = notes;
    if (rejectionReason) {
      parking.rejectionReason = rejectionReason;
    }

    await parking.save();

    await logAuditEvent({
      performedBy: req.user._id,
      action: `VERIFICATION_${status}`,
      targetEntity: 'PARKING',
      targetId: parking._id,
      previousState,
      newState: {
        verificationStatus: parking.verificationStatus,
        verificationNotes: parking.verificationNotes,
        rejectionReason: parking.rejectionReason
      },
      reason: rejectionReason || notes || `Admin approved status change to ${status}`
    });

    return ApiResponse.success(res, { parking }, `Parking marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { operationalStatus, reason = '' } = req.body;

    if (!['OPEN', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED'].includes(operationalStatus)) {
      return ApiResponse.error(res, 'Invalid operational status', 400);
    }

    const parking = await Parking.findById(id);
    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    const previousState = { operationalStatus: parking.operationalStatus };
    parking.operationalStatus = operationalStatus;
    parking.updatedBy = req.user._id;
    await parking.save();

    await logAuditEvent({
      performedBy: req.user._id,
      action: 'UPDATE_OPERATIONAL_STATUS',
      targetEntity: 'PARKING',
      targetId: parking._id,
      previousState,
      newState: { operationalStatus },
      reason
    });

    return ApiResponse.success(res, { parking }, `Parking operational status updated to ${operationalStatus}`);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      ParkingReport.find(query)
        .populate('parkingId', 'name locality address verificationStatus')
        .populate('userId', 'name email')
        .populate('resolvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ParkingReport.countDocuments(query)
    ]);

    return ApiResponse.paginated(res, reports, { page: pageNum, limit: limitNum, total }, 'Reports retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;

    if (!['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return ApiResponse.error(res, 'Status must be UNDER_REVIEW, RESOLVED, or DISMISSED', 400);
    }

    const report = await ParkingReport.findById(id);
    if (!report) {
      return ApiResponse.error(res, 'Report not found', 404);
    }

    report.status = status;
    report.adminNotes = adminNotes;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    await logAuditEvent({
      performedBy: req.user._id,
      action: `REPORT_${status}`,
      targetEntity: 'REPORT',
      targetId: report._id,
      newState: { status, adminNotes },
      reason: adminNotes || `Admin updated report status to ${status}`
    });

    return ApiResponse.success(res, { report }, `Report updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const getCoverageStats = async (req, res, next) => {
  try {
    const [
      totalRecords,
      categoryCounts,
      localityCounts,
      statusCounts,
      missingCoordinatesCount,
      missingPriceCount,
      missingCapacityCount,
      lastImportJob
    ] = await Promise.all([
      Parking.countDocuments(),
      Parking.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Parking.aggregate([
        { $group: { _id: '$locality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),
      Parking.aggregate([{ $group: { _id: '$verificationStatus', count: { $sum: 1 } } }]),
      Parking.countDocuments({ hasCoordinates: { $ne: true } }),
      Parking.countDocuments({ pricingModel: 'UNKNOWN' }),
      Parking.countDocuments({
        $or: [{ 'totalCapacity.total': null }, { 'totalCapacity.total': { $exists: false } }]
      }),
      DataImportJob.findOne().sort({ createdAt: -1 })
    ]);

    return ApiResponse.success(
      res,
      {
        totalRecords,
        categoryCounts,
        localityCounts,
        statusCounts,
        missingCoordinatesCount,
        missingPriceCount,
        missingCapacityCount,
        lastImportJob
      },
      'Coverage statistics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetEntity, page = 1, limit = 30 } = req.query;
    const query = {};
    if (action) query.action = action;
    if (targetEntity) query.targetEntity = targetEntity;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 30));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query)
    ]);

    return ApiResponse.paginated(res, logs, { page: pageNum, limit: limitNum, total }, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    return ApiResponse.paginated(res, users, { page: pageNum, limit: limitNum, total }, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (user.role === 'ADMIN') {
      return ApiResponse.error(res, 'Cannot modify status of an administrator', 403);
    }

    const previousStatus = user.status;
    user.status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await user.save();

    await logAuditEvent({
      performedBy: req.user._id,
      action: 'TOGGLE_USER_STATUS',
      targetEntity: 'USER',
      targetId: user._id,
      previousState: { status: previousStatus },
      newState: { status: user.status },
      reason: `Admin changed user status to ${user.status}`
    });

    return ApiResponse.success(res, { user }, `User status changed to ${user.status}`);
  } catch (error) {
    next(error);
  }
};
