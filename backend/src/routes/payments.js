import express from 'express';
import crypto from 'crypto';
import { body } from 'express-validator';
import User from '../models/User.js';
import Job from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import dynamicConfig from '../config/dynamicConfig.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @route   GET /api/payments/methods
// @desc    Get user's payment methods
// @access  Private (User only)
router.get('/methods', authenticate, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('paymentMethods');
    
    res.json({
      success: true,
      data: { paymentMethods: user.paymentMethods || [] },
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods',
    });
  }
});

// @route   POST /api/payments/methods
// @desc    Add new payment method
// @access  Private (User only)
router.post('/methods', [
  authenticate,
  authorize('user'),
  body('type').isIn(['card', 'bank', 'digital_wallet']).withMessage('Invalid payment method type'),
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name is required and must be less than 50 characters'),
  body('details').isObject().withMessage('Payment details are required'),
  validateRequest,
], async (req, res) => {
  try {
    const { type, name, details, isDefault } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user.paymentMethods) {
      user.paymentMethods = [];
    }

    // If this is the first payment method or marked as default, make it default
    const shouldSetDefault = isDefault || user.paymentMethods.length === 0;

    if (shouldSetDefault) {
      // Unset all other default methods
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    const newPaymentMethod = {
      type,
      name,
      details: {
        ...details,
        // Mask sensitive information
        ...(type === 'card' && details.cardNumber && {
          cardNumber: '****-****-****-' + details.cardNumber.slice(-4),
          lastFour: details.cardNumber.slice(-4)
        })
      },
      isDefault: shouldSetDefault,
      isActive: true,
      createdAt: new Date()
    };

    user.paymentMethods.push(newPaymentMethod);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: { paymentMethod: newPaymentMethod },
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment method',
    });
  }
});

// @route   PUT /api/payments/methods/:methodId
// @desc    Update payment method
// @access  Private (User only)
router.put('/methods/:methodId', [
  authenticate,
  authorize('user'),
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
  body('isDefault').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  validateRequest,
], async (req, res) => {
  try {
    const { methodId } = req.params;
    const { name, isDefault, isActive } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const paymentMethod = user.paymentMethods.id(methodId);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    if (name) paymentMethod.name = name;
    if (typeof isActive !== 'undefined') paymentMethod.isActive = isActive;

    if (isDefault) {
      // Unset all other default methods
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
      paymentMethod.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: { paymentMethod },
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment method',
    });
  }
});

// @route   DELETE /api/payments/methods/:methodId
// @desc    Delete payment method
// @access  Private (User only)
router.delete('/methods/:methodId', authenticate, authorize('user'), async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const paymentMethod = user.paymentMethods.id(methodId);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found',
      });
    }

    // Check if this payment method is used in any pending jobs
    const pendingJobs = await Job.countDocuments({
      user: userId,
      paymentMethodId: methodId,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });

    if (pendingJobs > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete payment method that is used in pending jobs',
      });
    }

    const wasDefault = paymentMethod.isDefault;
    user.paymentMethods.pull(methodId);

    // If we deleted the default method, make the first remaining method default
    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method',
    });
  }
});

// @route   POST /api/payments/jobs/:jobId/pay
// @desc    Process payment for a job
// @access  Private (User only)
router.post('/jobs/:jobId/pay', [
  authenticate,
  authorize('user'),
  body('paymentMethodId').isMongoId().withMessage('Valid payment method ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  validateRequest,
], async (req, res) => {
  try {
    const { jobId } = req.params;
    const { paymentMethodId, amount } = req.body;
    const userId = req.user._id;

    const job = await Job.findOne({
      _id: jobId,
      user: userId,
      status: 'completed'
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not ready for payment',
      });
    }

    if (job.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Job has already been paid',
      });
    }

    const user = await User.findById(userId);
    const paymentMethod = user.paymentMethods.id(paymentMethodId);

    if (!paymentMethod || !paymentMethod.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive payment method',
      });
    }

    // In a real implementation, you would process the payment with a payment provider
    // For now, we'll simulate a successful payment
    
    job.paymentStatus = 'paid';
    job.finalPrice = amount;
    job.paymentMethod = paymentMethod.type;
    job.paymentMethodId = paymentMethodId;
    job.paidAt = new Date();

    await job.save();

    // Create notification for professional
    await Notification.createNotification({
      recipient: job.professional,
      recipientModel: 'Professional',
      type: 'payment_received',
      title: 'Payment Received',
      message: `Payment of $${amount} received for job "${job.title}"`,
      relatedJob: job._id,
      relatedUser: userId,
      relatedUserModel: 'User',
    });

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
    });
  }
});

// @route   GET /api/payments/transactions
// @desc    Get user's payment transactions
// @access  Private (User only)
router.get('/transactions', authenticate, authorize('user'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Job.find({
      user: req.user._id,
      paymentStatus: 'paid'
    })
      .populate('professional', 'firstName lastName')
      .select('title finalPrice paymentMethod paidAt professional status')
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Job.countDocuments({
      user: req.user._id,
      paymentStatus: 'paid'
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTransactions / limit),
          totalTransactions,
        },
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
    });
  }
});

// Razorpay public key for client initialization
router.get('/razorpay/key', authenticate, authorize('user'), async (req, res) => {
  try {
    const keyId = dynamicConfig.getRazorpayKeyId();
    
    if (!keyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Razorpay not configured. Please configure payment gateway.' 
      });
    }

    return res.json({
      success: true,
      data: { keyId },
    });
  } catch (error) {
    console.error('Get Razorpay key error:', error);
    return res.status(500).json({ success: false, message: 'Error getting Razorpay key' });
  }
});

// Create Razorpay order
router.post('/razorpay/order', [
  authenticate,
  authorize('user'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  validateRequest,
], async (req, res) => {
  try {
    const { jobId, amount, currency } = req.body;
    const userId = req.user._id;

    // Validate amount
    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const job = await Job.findOne({ _id: jobId, user: userId });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Job has already been paid' });
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Job must be completed before payment' });
    }

    console.log('Creating Razorpay order:', {
      amount: numAmount,
      amountInPaise: Math.round(numAmount * 100),
      jobId,
      userId
    });

    // Get dynamic Razorpay instance
    const razorpay = dynamicConfig.getRazorpayInstance();

    // Create order following Razorpay standards
    // Generate a short receipt ID (max 40 characters)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const jobIdShort = String(jobId).slice(-8); // Last 8 characters of jobId
    const receipt = `job_${jobIdShort}_${timestamp}`; // Format: job_12345678_87654321 (max ~25 chars)
    
    const orderOptions = {
      amount: Math.round(numAmount * 100), // Amount in paise (smallest currency unit)
      currency: currency || 'INR',
      receipt: receipt, // Unique receipt ID (max 40 chars)
      notes: {
        jobId: String(jobId),
        userId: String(userId),
        jobTitle: job.title,
        customerName: typeof job.user === 'object' ? `${job.user.firstName} ${job.user.lastName}` : 'Customer',
        serviceCategory: job.category,
        scheduledDate: job.scheduledDate,
      },
      payment_capture: 1, // Auto-capture payment (recommended)
    };

    console.log('Receipt ID generated:', receipt, '(length:', receipt.length, ')');

    const order = await razorpay.orders.create(orderOptions);

    job.paymentProvider = 'razorpay';
    job.razorpayOrderId = order.id;
    job.finalPrice = numAmount;
    await job.save();

    console.log('Razorpay order created successfully:', order.id);

    return res.json({
      success: true,
      data: { order, keyId: dynamicConfig.getRazorpayKeyId() },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      razorpayError: error.error || error.description
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Error creating order',
      details: error.message 
    });
  }
});

// Verify Razorpay payment (server-side)
router.post('/razorpay/verify', [
  authenticate,
  authorize('user'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('razorpay_order_id').isString(),
  body('razorpay_payment_id').isString(),
  body('razorpay_signature').isString(),
  validateRequest,
], async (req, res) => {
  try {
    const { jobId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    const job = await Job.findOne({ _id: jobId, user: userId });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Get the secret key from dynamic config
    const keySecret = dynamicConfig.config?.razorpay?.keySecret || process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: configuration error' });
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    job.paymentStatus = 'paid';
    job.paymentMethod = 'online';
    job.paymentProvider = 'razorpay';
    job.razorpayOrderId = razorpay_order_id;
    job.razorpayPaymentId = razorpay_payment_id;
    job.razorpaySignature = razorpay_signature;
    job.paidAt = new Date();

    await job.save();

    if (job.professional) {
      // Get the provider earnings amount (after commission)
      const providerEarnings = job.commission?.providerEarnings || job.finalPrice;
      
      await Notification.createNotification({
        recipient: job.professional,
        recipientModel: 'Professional',
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment completed! You earned ₹${providerEarnings?.toFixed(2)} for job "${job.title}" (₹${job.finalPrice} total - 10% platform fee)`,
        relatedJob: job._id,
        relatedUser: userId,
        relatedUserModel: 'User',
      });
    }

    return res.json({ success: true, message: 'Payment verified successfully', data: { job } });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
});

// @route   POST /api/payments/razorpay/webhook
// @desc    Handle Razorpay webhooks for payment status updates
// @access  Public (Razorpay webhook)
router.post('/razorpay/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    // Get webhook secret from dynamic config or env
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(400).json({ success: false, message: 'Webhook not configured' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Razorpay webhook received:', event.event, event.payload?.payment?.entity?.id);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity, event.payload.payment.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Helper function to handle payment captured event
async function handlePaymentCaptured(payment) {
  try {
    const job = await Job.findOne({ razorpayOrderId: payment.order_id });
    if (!job) {
      console.error('Job not found for order:', payment.order_id);
      return;
    }

    // Update job payment status
    job.paymentStatus = 'paid';
    job.razorpayPaymentId = payment.id;
    job.paidAt = new Date();
    await job.save();

    // Notify professional about payment
    if (job.professional) {
      const providerEarnings = job.commission?.providerEarnings || job.finalPrice;
      
      await Notification.createNotification({
        recipient: job.professional,
        recipientModel: 'Professional',
        type: 'payment_received',
        title: 'Payment Received! 💰',
        message: `Payment of ₹${job.finalPrice} received for "${job.title}". You earned ₹${providerEarnings?.toFixed(2)} after platform fees.`,
        relatedJob: job._id,
        relatedUser: job.user,
        relatedUserModel: 'User',
      });
    }

    console.log('Payment captured processed for job:', job._id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

// Helper function to handle payment failed event
async function handlePaymentFailed(payment) {
  try {
    const job = await Job.findOne({ razorpayOrderId: payment.order_id });
    if (!job) {
      console.error('Job not found for order:', payment.order_id);
      return;
    }

    // Update job payment status
    job.paymentStatus = 'failed';
    job.razorpayPaymentId = payment.id;
    await job.save();

    // Notify user about payment failure
    await Notification.createNotification({
      recipient: job.user,
      recipientModel: 'User',
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Payment for "${job.title}" failed. Please try again or contact support.`,
      relatedJob: job._id,
      priority: 'high',
    });

    console.log('Payment failed processed for job:', job._id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Helper function to handle order paid event
async function handleOrderPaid(order, payment) {
  try {
    const job = await Job.findOne({ razorpayOrderId: order.id });
    if (!job) {
      console.error('Job not found for order:', order.id);
      return;
    }

    // This is a backup handler in case payment.captured wasn't received
    if (job.paymentStatus !== 'paid') {
      await handlePaymentCaptured(payment);
    }

    console.log('Order paid processed for job:', job._id);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

export default router;
