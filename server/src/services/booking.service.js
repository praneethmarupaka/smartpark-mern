import { Booking } from '../models/Booking.model.js';
import { Parking } from '../models/Parking.model.js';
import { generateBookingToken, generateQrDataUrl } from '../utils/qr.utils.js';

export class BookingService {
  /**
   * Validate and create a new reservation
   */
  static async createBooking({
    userId,
    parkingId,
    vehicleType,
    vehicleNumber,
    startTime,
    endTime
  }) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date(Date.now() - 5 * 60 * 1000); // 5 min grace

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid start or end time format');
    }

    if (start < now) {
      throw new Error('Start time cannot be in the past');
    }

    if (end <= start) {
      throw new Error('End time must be after start time');
    }

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 48) {
      throw new Error('Maximum reservation duration is 48 hours');
    }

    // Check parking facility
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      throw new Error('Parking facility not found');
    }

    if (parking.operationalStatus !== 'OPEN') {
      throw new Error(`Parking facility is currently ${parking.operationalStatus.toLowerCase().replace('_', ' ')}`);
    }

    if (!parking.bookingSupported) {
      throw new Error('This facility does not support online reservations. Discovery and directions are available.');
    }

    if (!parking.supportedVehicleTypes.includes(vehicleType)) {
      throw new Error(`This facility does not support ${vehicleType.replace('_', ' ').toLowerCase()}`);
    }

    // Check overlapping reservations for capacity validation
    const overlappingBookings = await Booking.countDocuments({
      parkingId,
      vehicleType,
      bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN'] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    const capacityField = vehicleType === 'TWO_WHEELER' ? 'twoWheeler' : 'fourWheeler';
    const capacityLimit = parking.totalCapacity?.[capacityField] || parking.totalCapacity?.total || 50;

    if (overlappingBookings >= capacityLimit) {
      throw new Error('No reservation slots available for this vehicle type during the requested time interval');
    }

    // Calculate estimated pricing
    let ratePerHour = 0;
    let isFree = parking.pricingModel === 'FREE';

    if (!isFree && parking.pricing) {
      ratePerHour =
        vehicleType === 'TWO_WHEELER'
          ? parking.pricing.twoWheelerHourlyRate || 15
          : parking.pricing.fourWheelerHourlyRate || 40;
    }

    const totalEstimatedAmount = isFree ? 0 : Math.round(ratePerHour * Math.ceil(durationHours));

    // Generate unique booking reference and secure token
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingReference = `SP-${datePrefix}-${randomHex}`;

    const qrToken = generateBookingToken();
    const qrPayload = {
      ref: bookingReference,
      parkingId: parking._id.toString(),
      token: qrToken
    };
    const qrDataUrl = await generateQrDataUrl(qrPayload);

    // Atomically create booking
    const booking = await Booking.create({
      bookingReference,
      userId,
      parkingId,
      vehicleType,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      startTime: start,
      endTime: end,
      bookingStatus: 'CONFIRMED',
      qrToken,
      qrDataUrl,
      priceSnapshot: {
        ratePerHour,
        durationHours: Math.ceil(durationHours),
        totalEstimatedAmount,
        currency: 'INR',
        isFree
      }
    });

    // If available slots are maintained, decrement them
    if (parking.availableSlots && parking.availableSlots[capacityField] > 0) {
      await Parking.findByIdAndUpdate(parkingId, {
        $inc: {
          [`availableSlots.${capacityField}`]: -1,
          'availableSlots.total': -1
        }
      });
    }

    return booking;
  }

  /**
   * Cancel an active booking
   */
  static async cancelBooking({ bookingId, userId, reason = 'User requested cancellation' }) {
    const booking = await Booking.findById(bookingId).populate('parkingId');
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check ownership if not admin
    if (userId && booking.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (!['CONFIRMED', 'PENDING'].includes(booking.bookingStatus)) {
      throw new Error(`Cannot cancel a booking with status: ${booking.bookingStatus}`);
    }

    booking.bookingStatus = 'CANCELLED';
    booking.cancellationReason = reason;
    await booking.save();

    // Release slot back
    const capacityField = booking.vehicleType === 'TWO_WHEELER' ? 'twoWheeler' : 'fourWheeler';
    await Parking.findByIdAndUpdate(booking.parkingId._id, {
      $inc: {
        [`availableSlots.${capacityField}`]: 1,
        'availableSlots.total': 1
      }
    });

    return booking;
  }

  /**
   * Validate QR token and check-in vehicle
   */
  static async checkInBooking({ tokenOrRef, ownerId }) {
    const query = tokenOrRef.startsWith('SP-')
      ? { bookingReference: tokenOrRef }
      : { qrToken: tokenOrRef };

    const booking = await Booking.findOne(query).populate('parkingId').populate('userId', 'name email phone');
    if (!booking) {
      throw new Error('Invalid QR code or booking reference');
    }

    // Ensure owner is authorized for this parking facility
    if (ownerId && booking.parkingId.createdBy && booking.parkingId.createdBy.toString() !== ownerId.toString()) {
      throw new Error('You are not authorized to validate bookings for this parking facility');
    }

    if (booking.bookingStatus === 'CHECKED_IN') {
      throw new Error('Vehicle is already checked in');
    }

    if (booking.bookingStatus === 'COMPLETED') {
      throw new Error('This booking is already completed');
    }

    if (booking.bookingStatus === 'CANCELLED') {
      throw new Error('This booking was cancelled');
    }

    if (booking.bookingStatus === 'EXPIRED') {
      throw new Error('This booking has expired');
    }

    const now = new Date();
    // Allow check-in within reasonable window: up to 1 hour before start time or before end time
    if (now > new Date(booking.endTime)) {
      booking.bookingStatus = 'EXPIRED';
      await booking.save();
      throw new Error('Booking time interval has ended. Booking marked as expired.');
    }

    booking.bookingStatus = 'CHECKED_IN';
    booking.checkInAt = now;
    await booking.save();

    return booking;
  }

  /**
   * Check out vehicle and complete booking
   */
  static async checkOutBooking({ tokenOrRef, ownerId }) {
    const query = tokenOrRef.startsWith('SP-')
      ? { bookingReference: tokenOrRef }
      : { qrToken: tokenOrRef };

    const booking = await Booking.findOne(query).populate('parkingId').populate('userId', 'name email phone');
    if (!booking) {
      throw new Error('Invalid QR code or booking reference');
    }

    if (ownerId && booking.parkingId.createdBy && booking.parkingId.createdBy.toString() !== ownerId.toString()) {
      throw new Error('You are not authorized to check out bookings for this parking facility');
    }

    if (booking.bookingStatus !== 'CHECKED_IN') {
      throw new Error(`Cannot check out. Current status is ${booking.bookingStatus}`);
    }

    booking.bookingStatus = 'COMPLETED';
    booking.checkOutAt = new Date();
    await booking.save();

    // Release capacity back
    const capacityField = booking.vehicleType === 'TWO_WHEELER' ? 'twoWheeler' : 'fourWheeler';
    await Parking.findByIdAndUpdate(booking.parkingId._id, {
      $inc: {
        [`availableSlots.${capacityField}`]: 1,
        'availableSlots.total': 1
      }
    });

    return booking;
  }
}
