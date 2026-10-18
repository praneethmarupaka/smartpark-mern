import mongoose from 'mongoose';

const parkingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parking name is required'],
      trim: true,
      minlength: 2,
      maxlength: 200
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['PUBLIC', 'PRIVATE', 'COMMERCIAL', 'GOVERNMENT', 'GHMC', 'TRANSPORT', 'OTHER'],
      default: 'PUBLIC'
    },
    facilityType: {
      type: String,
      enum: [
        'Metro station parking',
        'Railway station parking',
        'Bus station parking',
        'GHMC parking grounds',
        'Government parking facilities',
        'Shopping mall parking',
        'Markets and commercial complexes',
        'Hospitals and offices',
        'Street and public parking',
        'Stadiums, playgrounds and event parking',
        'Multilevel parking facilities',
        'Other legitimate parking facilities'
      ],
      default: 'Other legitimate parking facilities'
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true
    },
    city: {
      type: String,
      default: 'Hyderabad',
      trim: true
    },
    state: {
      type: String,
      default: 'Telangana',
      trim: true
    },
    postalCode: {
      type: String,
      trim: true,
      default: ''
    },
    // GeoJSON Point: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number] // [lng, lat]
      }
    },
    hasCoordinates: {
      type: Boolean,
      default: false
    },
    supportedVehicleTypes: {
      type: [String],
      enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE'],
      default: ['TWO_WHEELER', 'FOUR_WHEELER']
    },
    publicAccess: {
      type: String,
      enum: ['PUBLIC', 'CUSTOMERS_ONLY', 'STAFF_ONLY', 'PERMIT_REQUIRED', 'RESTRICTED', 'UNKNOWN'],
      default: 'PUBLIC'
    },
    accessInstructions: {
      type: String,
      trim: true,
      default: ''
    },
    pricingModel: {
      type: String,
      enum: ['FREE', 'PAID', 'VARIABLE', 'UNKNOWN'],
      default: 'UNKNOWN'
    },
    pricing: {
      twoWheelerHourlyRate: { type: Number, default: null },
      fourWheelerHourlyRate: { type: Number, default: null },
      dailyPassRate: { type: Number, default: null },
      currency: { type: String, default: 'INR' },
      notes: { type: String, default: '' }
    },
    totalCapacity: {
      twoWheeler: { type: Number, default: null, min: 0 },
      fourWheeler: { type: Number, default: null, min: 0 },
      total: { type: Number, default: null, min: 0 }
    },
    availableSlots: {
      twoWheeler: { type: Number, default: null, min: 0 },
      fourWheeler: { type: Number, default: null, min: 0 },
      total: { type: Number, default: null, min: 0 }
    },
    openingHours: {
      is24x7: { type: Boolean, default: false },
      opensAt: { type: String, default: '06:00' },
      closesAt: { type: String, default: '22:00' },
      daysOpen: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    },
    bookingSupported: {
      type: Boolean,
      default: false
    },
    photos: {
      type: [String],
      default: []
    },
    sourceEvidence: {
      type: String,
      default: ''
    },
    dataSource: {
      type: String,
      default: 'Admin Manual Entry'
    },
    sourceReference: {
      type: String,
      default: ''
    },
    importedAt: {
      type: Date,
      default: null
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_CORRECTION', 'UNVERIFIED'],
      default: 'UNVERIFIED'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verificationNotes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    operationalStatus: {
      type: String,
      enum: ['OPEN', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED', 'UNKNOWN'],
      default: 'OPEN'
    },
    lastAvailabilityUpdate: {
      type: Date,
      default: null
    },
    availabilityUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: compute slug and ensure hasCoordinates flag matches
parkingSchema.pre('save', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);
  }

  if (
    this.location &&
    this.location.type === 'Point' &&
    Array.isArray(this.location.coordinates) &&
    this.location.coordinates.length === 2 &&
    typeof this.location.coordinates[0] === 'number' &&
    typeof this.location.coordinates[1] === 'number'
  ) {
    this.hasCoordinates = true;
  } else {
    this.hasCoordinates = false;
  }

  // Recalculate capacity total if individual vehicle capacities are provided
  if (this.totalCapacity) {
    const tw = this.totalCapacity.twoWheeler || 0;
    const fw = this.totalCapacity.fourWheeler || 0;
    if (tw > 0 || fw > 0) {
      this.totalCapacity.total = tw + fw;
    }
  }

  // Recalculate available total if individual available slots are provided
  if (this.availableSlots) {
    const tw = this.availableSlots.twoWheeler || 0;
    const fw = this.availableSlots.fourWheeler || 0;
    if (tw > 0 || fw > 0) {
      this.availableSlots.total = tw + fw;
    }
  }

  next();
});

// Indexes
parkingSchema.index({ location: '2dsphere' }, { sparse: true });
parkingSchema.index({ name: 'text', locality: 'text', address: 'text' });
parkingSchema.index({ category: 1, verificationStatus: 1, operationalStatus: 1 });
parkingSchema.index({ locality: 1 });
parkingSchema.index({ createdBy: 1 });

export const Parking = mongoose.model('Parking', parkingSchema);
