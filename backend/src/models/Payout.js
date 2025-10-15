import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Payout amount is required'],
    min: [1, 'Payout amount must be at least ₹1'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  bankAccount: {
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
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
  },
  transactionReference: {
    type: String,
    trim: true,
  },
  processingFee: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  failureReason: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
payoutSchema.index({ professional: 1, status: 1 });
payoutSchema.index({ status: 1, requestedAt: -1 });
payoutSchema.index({ requestedAt: -1 });

// Calculate net amount before saving
payoutSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('processingFee')) {
    this.netAmount = this.amount - (this.processingFee || 0);
  }
  next();
});

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;