import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    targetEntity: {
      type: String,
      enum: ['PARKING', 'USER', 'BOOKING', 'REPORT', 'IMPORT_JOB', 'SYSTEM'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    reason: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ targetEntity: 1, targetId: 1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
