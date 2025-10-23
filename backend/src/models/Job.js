import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Job description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Job category is required'],
    enum: [
      'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
      'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'
    ],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.changedByModel'
    },
    changedByModel: {
      type: String,
      enum: ['User', 'Professional', 'Admin']
    },
    notes: String
  }],
  invoice: {
    number: String,
    date: Date,
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }],
    subtotal: Number,
    tax: Number,
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paymentMethod: String,
    notes: String
  },

  // User who posted the job
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Professional assigned to the job
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    default: null,
  },

  // Location details
  location: {
    address: {
      type: String,
      required: [true, 'Job address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },

  // GeoJSON point for geospatial queries (derived from location.coordinates)
  locationPoint: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },


  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required'],
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 2,
  },

  // Pricing
  budget: {
    min: {
      type: Number,
      min: [0, 'Budget minimum cannot be negative'],
    },
    max: {
      type: Number,
      min: [0, 'Budget maximum cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  fixedRate: {
    type: Number,
    min: [0, 'Fixed rate cannot be negative'],
  },
  finalPrice: {
    type: Number,
    min: [0, 'Final price cannot be negative'],
  },
  tipAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tip amount cannot be negative'],
  },
  
  // Commission breakdown
  commission: {
    total: {
      type: Number,
      default: 0,
    },
    companyFee: {
      type: Number,
      default: 0,
    },
    providerEarnings: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 0.10, // 10% company commission
    },
  },

  // Images
  images: [{
    url: String,
    description: String,
  }],

  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'messages.senderModel',
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['User', 'Professional'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],

  // Completion details
  completedAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters'],
  },

  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cash_pending', 'cash_verified', 'payment_received', 'payment_confirmed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online'],
  },
  paymentProvider: {
    type: String,
    enum: ['razorpay', 'none'],
    default: 'none',
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  
  // Enhanced cash payment details
  cashPaymentDetails: {
    professionalMarkedReceived: {
      type: Boolean,
      default: false,
    },
    professionalReceivedAt: Date,
    customerConfirmed: {
      type: Boolean,
      default: false,
    },
    customerConfirmedAt: Date,
    receiptPhotos: [{
      url: String,
      uploadedBy: {
        type: String,
        enum: ['professional', 'customer'],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    amount: Number,
    verificationCode: String,
    disputeRaised: {
      type: Boolean,
      default: false,
    },
    disputeDetails: {
      raisedBy: {
        type: String,
        enum: ['professional', 'customer'],
      },
      reason: String,
      raisedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'under_review', 'resolved'],
        default: 'pending',
      },
      resolution: String,
      resolvedAt: Date,
    },
  },

  // Chat read timestamps
  userLastReadAt: {
    type: Date,
    default: Date.now,
  },
  professionalLastReadAt: {
    type: Date,
    default: Date.now,
  },

  // Metadata
  isUrgent: {
    type: Boolean,
    default: false,
  },
  tags: [String],

  // Track professionals who declined this job
  declinedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
  }],

}, {
  timestamps: true,
});

// Pre-save middleware to validate locationPoint
jobSchema.pre('save', function(next) {
  // If locationPoint exists but is incomplete or empty, remove it
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
  next();
});

// Pre-update middleware to validate locationPoint
jobSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
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

// Geospatial index
jobSchema.index({ locationPoint: '2dsphere' });


// Indexes for better query performance
jobSchema.index({ user: 1, status: 1 });
jobSchema.index({ professional: 1, status: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ scheduledDate: 1 });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ 'location.zipCode': 1 });


// Virtual for job duration in a readable format
jobSchema.virtual('durationFormatted').get(function() {
  if (this.estimatedDuration < 1) {
    return `${Math.round(this.estimatedDuration * 60)} minutes`;
  }
  return `${this.estimatedDuration} hour${this.estimatedDuration !== 1 ? 's' : ''}`;
});

// Method to check if job can be cancelled
jobSchema.methods.canBeCancelled = function() {
  return ['pending', 'accepted', 'in_progress'].includes(this.status);
};

// Method to check if job can be rated
jobSchema.methods.canBeRated = function() {
  return this.status === 'completed';
};

// Method to update job status and record history
jobSchema.methods.updateStatus = async function(newStatus, userId, userType, notes = '') {
  if (!['pending', 'accepted', 'in_progress', 'completed', 'cancelled'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  const statusUpdate = {
    status: newStatus,
    changedBy: userId,
    changedByModel: userType,
    notes
  };

  this.status = newStatus;
  this.statusHistory.push(statusUpdate);
  
  // If completing the job, generate invoice if not already exists
  if (newStatus === 'completed' && !this.invoice?.number) {
    await this.generateInvoice();
  }
  
  await this.save();
  return this;
};

// Method to generate invoice
jobSchema.methods.generateInvoice = async function() {
  if (this.status !== 'completed') {
    throw new Error('Cannot generate invoice for incomplete job');
  }
  
  if (this.invoice?.number) {
    return this.invoice; // Invoice already exists
  }
  
  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const taxRate = 0.18; // 18% GST
  
  // Get the actual booked amount - prioritize finalPrice, then fixedRate, then budget max
  const bookedAmount = this.finalPrice || this.fixedRate || this.budget?.max || 0;
  const tip = this.tipAmount || 0;
  const serviceAmount = bookedAmount + tip;
  
  // Create invoice items based on job details
  const items = [{
    description: `${this.category} Service - ${this.title || 'Professional Service'}`,
    quantity: 1,
    unitPrice: bookedAmount,
    total: bookedAmount
  }];
  
  // Add tip as separate line item if present
  if (tip > 0) {
    items.push({
      description: 'Tip Amount',
      quantity: 1,
      unitPrice: tip,
      total: tip
    });
  }
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  this.invoice = {
    number: invoiceNumber,
    date: new Date(),
    items,
    subtotal,
    tax,
    total,
    status: 'pending',
    paymentMethod: this.paymentMethod || 'Online',
    notes: `Invoice for ${this.category} service completed on ${new Date().toLocaleDateString()}. Thank you for choosing our service!`
  };
  
  await this.save();
  return this.invoice;
};

// Add pre-save hook to initialize status history
jobSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{
      status: 'pending',
      changedAt: new Date(),
      notes: 'Job created'
    }];
  } else if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      notes: `Status changed to ${this.status}`
    });
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
