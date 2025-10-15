import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const professionalSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },
  userType: {
    type: String,
    enum: ['user', 'professional'],
    default: 'professional',
  },

  // Professional-specific fields
  services: [{
    type: String,
    required: [true, 'At least one service is required'],
    enum: [
      'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
      'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'
    ],
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true,
  },

  // Verification and status
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isProfileVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'in_review', 'verified', 'rejected'],
    default: 'pending',
  },

  // Professional details
  profileImage: {
    type: String,
    default: null,
  },
  businessName: {
    type: String,
    trim: true,
  },
  businessLicense: {
    type: String,
    trim: true,
  },
  insurance: {
    hasInsurance: {
      type: Boolean,
      default: false,
    },
    insuranceProvider: String,
    policyNumber: String,
  },

  // Ratings and reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },

  // Availability and pricing
  availability: {
    isAvailable: {
      type: Boolean,
      default: true,
    },
    workingHours: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String },
    },
  },
  pricing: {
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
    },
    minimumCharge: {
      type: Number,
      min: [0, 'Minimum charge cannot be negative'],
    },
  },

  // Location and service area
  serviceArea: {
    radius: {
      type: Number,
      default: 10, // km
      min: [1, 'Service radius must be at least 1 km'],
      max: [100, 'Service radius cannot exceed 100 km'],
    },
    cities: [String],
  },

  // Geolocation
  locationPoint: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  isBusy: {
    type: Boolean,
    default: false,
  },
  currentJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },

  // Bank account details for payouts
  bankAccount: {
    accountHolderName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationId: {
      type: String,
      trim: true,
    },
    fundAccountId: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    verificationError: {
      type: String,
      trim: true,
    },
    lastVerificationAttempt: {
      type: Date,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },

  // Statistics
  stats: {
    totalJobs: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    cancelledJobs: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

professionalSchema.index({ zipCode: 1 });


// Geospatial index
professionalSchema.index({ locationPoint: '2dsphere' });

// Indexes for better query performance
professionalSchema.index({ email: 1 });
professionalSchema.index({ phone: 1 });
professionalSchema.index({ services: 1 });
professionalSchema.index({ city: 1 });
professionalSchema.index({ 'rating.average': -1 });
professionalSchema.index({ verificationStatus: 1 });
professionalSchema.index({ isActive: 1 });

// Hash password before saving and validate locationPoint
professionalSchema.pre('save', async function(next) {
  // Validate locationPoint - if it exists but is incomplete or empty, remove it
  if (this.locationPoint) {
    if (Object.keys(this.locationPoint).length === 0 || 
        !this.locationPoint.type || 
        !this.locationPoint.coordinates || 
        !Array.isArray(this.locationPoint.coordinates) || 
        this.locationPoint.coordinates.length !== 2) {
      // Remove the field completely
      this.locationPoint = undefined;
      this.markModified('locationPoint');
    }
  }

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware to validate locationPoint
professionalSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  if (update.locationPoint) {
    if (Object.keys(update.locationPoint).length === 0 || 
        !update.locationPoint.type || 
        !update.locationPoint.coordinates || 
        !Array.isArray(update.locationPoint.coordinates) || 
        update.locationPoint.coordinates.length !== 2) {
      // Remove invalid locationPoint and add $unset operation
      delete update.locationPoint;
      if (!update.$unset) update.$unset = {};
      update.$unset.locationPoint = "";
    }
  }
  next();
});

// Instance method to check password
professionalSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
professionalSchema.methods.getPublicProfile = function() {
  const professionalObject = this.toObject();
  delete professionalObject.password;
  return professionalObject;
};

// Static method to find professional by email or phone
professionalSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { phone: identifier }
    ]
  });
};

const Professional = mongoose.model('Professional', professionalSchema);

export default Professional;
