import mongoose from 'mongoose';

const servicePricingSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    enum: [
      'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
      'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'
    ],
  },
  subServiceTitle: {
    type: String,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  description: String,
  duration: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  priceHistory: [{
    price: Number,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

// Index for faster queries
servicePricingSchema.index({ serviceName: 1, subServiceTitle: 1 });
servicePricingSchema.index({ updatedAt: -1 });

const ServicePricing = mongoose.model('ServicePricing', servicePricingSchema);

export default ServicePricing;
