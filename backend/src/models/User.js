import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
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
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: null,
  },
  addresses: [{
    label: { type: String, trim: true, default: 'Home' },
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
  }],
  // Optional geolocation for users (for distance to jobs, etc.)
  locationPoint: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [lng, lat]
    },
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
    autoAssignProfessional: {
      type: Boolean,
      default: false,
    },
  },
  // Track previously used professionals
  previousProfessionals: [{
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
    },
    lastServiceDate: Date,
    totalServicesCompleted: {
      type: Number,
      default: 1,
    },
    lastRating: Number,
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'bank', 'digital_wallet'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      // For cards
      cardNumber: String,
      lastFour: String,
      expiryMonth: Number,
      expiryYear: Number,
      cardType: String, // visa, mastercard, etc.

      // For bank accounts
      accountNumber: String,
      routingNumber: String,
      bankName: String,

      // For digital wallets
      walletType: String, // paypal, venmo, etc.
      walletId: String,

      // Common
      holderName: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  emergencyContact: {
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    relationship: {
      type: String,
      trim: true,
    },
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ userType: 1 });

// Hash password before saving and validate locationPoint
userSchema.pre('save', async function(next) {
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
userSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by email or phone

// Geospatial index for user location
userSchema.index({ locationPoint: '2dsphere' });

userSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { phone: identifier }
    ]
  });
};

const User = mongoose.model('User', userSchema);

export default User;
