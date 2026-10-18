import { Parking } from '../models/Parking.model.js';
import { ParkingReport } from '../models/ParkingReport.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { isValidCoordinates } from '../utils/geo.utils.js';
import { scoreParkingFacilities } from '../services/recommendation.service.js';
import { logAuditEvent } from '../services/audit.service.js';

export const getParkings = async (req, res, next) => {
  try {
    const {
      search,
      category,
      vehicleType,
      publicAccess,
      pricingModel,
      verifiedOnly,
      bookingSupported,
      operationalStatus,
      locality,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Only show OPEN by default unless specified
    if (operationalStatus) {
      query.operationalStatus = operationalStatus;
    } else {
      query.operationalStatus = { $ne: 'PERMANENTLY_CLOSED' };
    }

    if (category) {
      query.category = category;
    }

    if (locality) {
      query.locality = { $regex: locality, $options: 'i' };
    }

    if (vehicleType) {
      query.supportedVehicleTypes = vehicleType;
    }

    if (publicAccess) {
      query.publicAccess = publicAccess;
    }

    if (pricingModel) {
      query.pricingModel = pricingModel;
    }

    if (verifiedOnly === 'true' || verifiedOnly === true) {
      query.verificationStatus = 'VERIFIED';
    }

    if (bookingSupported === 'true' || bookingSupported === true) {
      query.bookingSupported = true;
    }

    // Text or regex search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { locality: searchRegex },
        { address: searchRegex },
        { facilityType: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Sort order
    let sortObj = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortObj = { 'pricing.fourWheelerHourlyRate': 1 };
    } else if (sortBy === 'price_desc') {
      sortObj = { 'pricing.fourWheelerHourlyRate': -1 };
    } else if (sortBy === 'freshness') {
      sortObj = { lastAvailabilityUpdate: -1 };
    } else if (sortBy === 'name') {
      sortObj = { name: 1 };
    }

    const [parkings, total] = await Promise.all([
      Parking.find(query).sort(sortObj).skip(skip).limit(limitNum),
      Parking.countDocuments(query)
    ]);

    return ApiResponse.paginated(
      res,
      parkings,
      { page: pageNum, limit: limitNum, total },
      'Parking directory fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getNearbyParkings = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radiusKm = 5,
      category,
      vehicleType = 'FOUR_WHEELER',
      verifiedOnly,
      bookingSupported,
      priority = 'best_overall'
    } = req.query;

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadiusKm = Math.min(50, Math.max(0.5, parseFloat(radiusKm) || 5));

    if (!isValidCoordinates(parsedLng, parsedLat)) {
      return ApiResponse.error(res, 'Valid coordinates (lat, lng) are required for nearby search', 400);
    }

    const query = {
      operationalStatus: { $ne: 'PERMANENTLY_CLOSED' },
      hasCoordinates: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat]
          },
          $maxDistance: parsedRadiusKm * 1000 // Convert km to meters
        }
      }
    };

    if (category) query.category = category;
    if (vehicleType) query.supportedVehicleTypes = vehicleType;
    if (verifiedOnly === 'true' || verifiedOnly === true) query.verificationStatus = 'VERIFIED';
    if (bookingSupported === 'true' || bookingSupported === true) query.bookingSupported = true;

    const facilities = await Parking.find(query).limit(50);

    // Apply transparent recommendation engine
    const scoredFacilities = scoreParkingFacilities(facilities, {
      userLat: parsedLat,
      userLng: parsedLng,
      vehicleType,
      priority
    });

    return ApiResponse.success(
      res,
      {
        count: scoredFacilities.length,
        radiusKm: parsedRadiusKm,
        results: scoredFacilities
      },
      'Nearby parking facilities fetched with recommendations'
    );
  } catch (error) {
    next(error);
  }
};

export const getParkingById = async (req, res, next) => {
  try {
    const parking = await Parking.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('verifiedBy', 'name');

    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    // Availability freshness evaluation
    let isAvailabilityStale = false;
    let hoursSinceUpdate = null;
    if (parking.lastAvailabilityUpdate) {
      hoursSinceUpdate = parseFloat(
        ((Date.now() - new Date(parking.lastAvailabilityUpdate).getTime()) / (1000 * 60 * 60)).toFixed(1)
      );
      if (hoursSinceUpdate > 4) {
        isAvailabilityStale = true;
      }
    }

    return ApiResponse.success(
      res,
      {
        parking,
        availabilityStatus: {
          isOwnerReported: !!parking.availabilityUpdatedBy,
          lastUpdated: parking.lastAvailabilityUpdate,
          hoursSinceUpdate,
          isStale: isAvailabilityStale
        }
      },
      'Parking facility retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const createParking = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      facilityType,
      address,
      locality,
      city = 'Hyderabad',
      state = 'Telangana',
      postalCode,
      lat,
      lng,
      supportedVehicleTypes,
      publicAccess,
      accessInstructions,
      pricingModel,
      pricing,
      totalCapacity,
      availableSlots,
      openingHours,
      bookingSupported,
      photos,
      sourceEvidence,
      dataSource,
      sourceReference
    } = req.body;

    const isAdmin = req.user.role === 'ADMIN';

    let location = undefined;
    let hasCoords = false;
    const parsedLng = parseFloat(lng);
    const parsedLat = parseFloat(lat);

    if (isValidCoordinates(parsedLng, parsedLat)) {
      location = {
        type: 'Point',
        coordinates: [parsedLng, parsedLat]
      };
      hasCoords = true;
    }

    // Owners can only create with PENDING verification status
    // Admin can create with VERIFIED or UNVERIFIED
    const verificationStatus = isAdmin ? (req.body.verificationStatus || 'VERIFIED') : 'PENDING';

    const parking = await Parking.create({
      name: name.trim(),
      description: description || '',
      category: category || 'PUBLIC',
      facilityType: facilityType || 'Other legitimate parking facilities',
      address: address.trim(),
      locality: locality.trim(),
      city,
      state,
      postalCode: postalCode || '',
      location,
      hasCoordinates: hasCoords,
      supportedVehicleTypes: supportedVehicleTypes || ['TWO_WHEELER', 'FOUR_WHEELER'],
      publicAccess: publicAccess || 'PUBLIC',
      accessInstructions: accessInstructions || '',
      pricingModel: pricingModel || 'UNKNOWN',
      pricing: pricing || {},
      totalCapacity: totalCapacity || {},
      availableSlots: availableSlots || totalCapacity || {},
      openingHours: openingHours || {},
      bookingSupported: bookingSupported === true || bookingSupported === 'true',
      photos: photos || [],
      sourceEvidence: sourceEvidence || '',
      dataSource: isAdmin ? (dataSource || 'Admin Manual Entry') : 'Owner Submitted',
      sourceReference: sourceReference || '',
      verificationStatus,
      verifiedBy: isAdmin && verificationStatus === 'VERIFIED' ? req.user._id : null,
      verifiedAt: isAdmin && verificationStatus === 'VERIFIED' ? new Date() : null,
      operationalStatus: 'OPEN',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    if (isAdmin) {
      await logAuditEvent({
        performedBy: req.user._id,
        action: 'CREATE_PARKING',
        targetEntity: 'PARKING',
        targetId: parking._id,
        newState: parking,
        reason: 'Admin directly registered parking record'
      });
    }

    return ApiResponse.created(res, { parking }, 'Parking facility created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateParking = async (req, res, next) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = req.user.role === 'OWNER' && parking.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return ApiResponse.error(res, 'Unauthorized to edit this parking facility', 403);
    }

    const previousState = parking.toObject();
    const updateData = { ...req.body };

    // Prevent non-admin from modifying verification status directly
    if (!isAdmin) {
      delete updateData.verificationStatus;
      delete updateData.verifiedBy;
      delete updateData.verifiedAt;
      delete updateData.verificationNotes;
    }

    // If owner modifies core location or access details, trigger re-verification requirement
    if (isOwner && !isAdmin) {
      const coreFieldsChanged =
        (updateData.address && updateData.address !== parking.address) ||
        (updateData.locality && updateData.locality !== parking.locality) ||
        (updateData.category && updateData.category !== parking.category) ||
        (updateData.publicAccess && updateData.publicAccess !== parking.publicAccess) ||
        (updateData.lat !== undefined && updateData.lng !== undefined);

      if (coreFieldsChanged && parking.verificationStatus === 'VERIFIED') {
        updateData.verificationStatus = 'PENDING';
        updateData.verificationNotes = 'Re-verification required due to critical location/access updates by owner';
      }
    }

    // Handle coordinate update
    if (updateData.lat !== undefined && updateData.lng !== undefined) {
      const parsedLng = parseFloat(updateData.lng);
      const parsedLat = parseFloat(updateData.lat);
      if (isValidCoordinates(parsedLng, parsedLat)) {
        updateData.location = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat]
        };
        updateData.hasCoordinates = true;
      }
    }

    updateData.updatedBy = req.user._id;

    const updatedParking = await Parking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    await logAuditEvent({
      performedBy: req.user._id,
      action: 'UPDATE_PARKING',
      targetEntity: 'PARKING',
      targetId: updatedParking._id,
      previousState,
      newState: updatedParking.toObject(),
      reason: isOwner ? 'Owner updated facility details' : 'Admin edited parking details'
    });

    return ApiResponse.success(res, { parking: updatedParking }, 'Parking facility updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const parking = await Parking.findById(req.params.id).select(
      'name operationalStatus totalCapacity availableSlots lastAvailabilityUpdate availabilityUpdatedBy bookingSupported'
    );

    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    let isStale = false;
    let hoursSinceUpdate = null;
    if (parking.lastAvailabilityUpdate) {
      hoursSinceUpdate = parseFloat(
        ((Date.now() - new Date(parking.lastAvailabilityUpdate).getTime()) / (1000 * 60 * 60)).toFixed(1)
      );
      if (hoursSinceUpdate > 4) {
        isStale = true;
      }
    }

    return ApiResponse.success(
      res,
      {
        parkingId: parking._id,
        name: parking.name,
        operationalStatus: parking.operationalStatus,
        totalCapacity: parking.totalCapacity,
        availableSlots: parking.availableSlots,
        lastAvailabilityUpdate: parking.lastAvailabilityUpdate,
        isOwnerReported: !!parking.availabilityUpdatedBy,
        isStale,
        hoursSinceUpdate,
        staleNotice: isStale ? 'Availability was updated more than 4 hours ago and may not reflect current conditions.' : null
      },
      'Availability retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const submitReport = async (req, res, next) => {
  try {
    const { issueType, explanation, evidenceUrl } = req.body;
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return ApiResponse.error(res, 'Parking facility not found', 404);
    }

    const report = await ParkingReport.create({
      parkingId: parking._id,
      userId: req.user._id,
      issueType,
      explanation: explanation.trim(),
      evidenceUrl: evidenceUrl || '',
      status: 'OPEN'
    });

    return ApiResponse.created(res, { report }, 'Thank you. Your report has been submitted for administrator review.');
  } catch (error) {
    next(error);
  }
};
