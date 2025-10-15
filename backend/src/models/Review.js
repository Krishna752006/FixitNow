import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true, // One review per job
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
  },
  // Detailed ratings
  categories: {
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  // Professional's response to review
  response: {
    text: String,
    respondedAt: Date,
  },
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  // Verification
  isVerified: {
    type: Boolean,
    default: true, // Verified if tied to a completed job
  },
}, {
  timestamps: true,
});

// Indexes
reviewSchema.index({ professional: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ job: 1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
