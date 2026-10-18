import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: [true, 'Parking ID is required']
    },
    vehicleType: {
      type: String,
      enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'OTHER'],
      required: [true, 'Vehicle type is required']
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
      default: 'CONFIRMED'
    },
    qrToken: {
      type: String,
      required: true
    },
    qrDataUrl: {
      type: String,
      default: ''
    },
    checkInAt: {
      type: Date,
      default: null
    },
    checkOutAt: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    priceSnapshot: {
      ratePerHour: { type: Number, default: 0 },
      durationHours: { type: Number, default: 1 },
      totalEstimatedAmount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isFree: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ parkingId: 1, bookingStatus: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ qrToken: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
