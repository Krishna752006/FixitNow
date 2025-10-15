import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: true,
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['User', 'Professional'],
  },
  
  type: {
    type: String,
    required: true,
    enum: [
      'job_created',
      'job_accepted',
      'job_completed',
      'job_cancelled',
      'payment_received',
      'payment_due',
      'payment_reminder',
      'review_received',
      'message_received',
      'profile_verified',
      'bank_account_updated',
      'bank_verification_pending',
      'bank_verification_completed',
      'bank_verification_failed',
      'payout_processed',
      'payout_failed',
      'system_update'
    ],
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  
  // Related entities
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedUserModel',
  },
  relatedUserModel: {
    type: String,
    enum: ['User', 'Professional'],
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  
  // Action data (for clickable notifications)
  actionUrl: String,
  actionData: mongoose.Schema.Types.Mixed,
  
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Here you could add real-time notification logic (WebSocket, etc.)
  
  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
