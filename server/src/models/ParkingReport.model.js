import mongoose from 'mongoose';

const parkingReportSchema = new mongoose.Schema(
  {
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: [true, 'Parking reference is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user is required']
    },
    issueType: {
      type: String,
      enum: [
        'INCORRECT_LOCATION',
        'DUPLICATE_RECORD',
        'CLOSED_FACILITY',
        'INCORRECT_PRICE',
        'INCORRECT_ACCESS_RESTRICTION',
        'MISLEADING_AVAILABILITY',
        'INACCESSIBLE_PARKING',
        'OTHER'
      ],
      required: [true, 'Issue type is required']
    },
    explanation: {
      type: String,
      required: [true, 'Detailed explanation is required'],
      trim: true,
      minlength: 10,
      maxlength: 1000
    },
    evidenceUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

parkingReportSchema.index({ parkingId: 1, status: 1 });
parkingReportSchema.index({ userId: 1, createdAt: -1 });

export const ParkingReport = mongoose.model('ParkingReport', parkingReportSchema);
