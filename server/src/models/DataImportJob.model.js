import mongoose from 'mongoose';

const dataImportJobSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    format: {
      type: String,
      enum: ['CSV', 'GEOJSON'],
      required: true
    },
    sourceName: {
      type: String,
      required: true,
      default: 'Directory Import'
    },
    sourceReference: {
      type: String,
      default: ''
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    importedCount: {
      type: Number,
      default: 0
    },
    duplicateCount: {
      type: Number,
      default: 0
    },
    invalidCount: {
      type: Number,
      default: 0
    },
    importErrors: [
      {
        row: Number,
        recordName: String,
        reason: String
      }
    ],
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

dataImportJobSchema.index({ createdAt: -1 });

export const DataImportJob = mongoose.model('DataImportJob', dataImportJobSchema);
