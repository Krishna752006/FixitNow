import mongoose from 'mongoose';

const favoriteProfessionalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  lastServiceDate: {
    type: Date,
  },
  totalServicesCompleted: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Compound index to ensure a user can't favorite the same professional twice
favoriteProfessionalSchema.index({ user: 1, professional: 1 }, { unique: true });

// Index for quick lookups
favoriteProfessionalSchema.index({ user: 1 });
favoriteProfessionalSchema.index({ professional: 1 });

const FavoriteProfessional = mongoose.model('FavoriteProfessional', favoriteProfessionalSchema);

export default FavoriteProfessional;
