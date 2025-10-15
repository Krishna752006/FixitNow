import express from 'express';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// Configure multer for receipt photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG) and PDF are allowed'));
  },
});

// Professional marks payment as received
router.post('/mark-received', authenticateToken, async (req, res) => {
  try {
    const { jobId, paymentMethod, amount } = req.body;
    const professionalId = req.user._id;

    const job = await Job.findById(jobId).populate('user');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.professional.toString() !== professionalId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Job must be completed first',
      });
    }

    // Generate verification code for SMS
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Update job with payment details
    job.paymentMethod = paymentMethod;
    job.paymentStatus = paymentMethod === 'cash' ? 'cash_pending' : 'payment_received';
    
    if (!job.cashPaymentDetails) {
      job.cashPaymentDetails = {};
    }
    
    job.cashPaymentDetails.professionalMarkedReceived = true;
    job.cashPaymentDetails.professionalReceivedAt = new Date();
    job.cashPaymentDetails.amount = amount || job.finalPrice;
    job.cashPaymentDetails.verificationCode = verificationCode;

    await job.save();

    // Send notification to customer
    await Notification.create({
      recipient: job.user._id,
      recipientModel: 'User',
      type: 'payment_confirmation_required',
      title: 'Payment Confirmation Required',
      message: `Professional has marked payment as received for job "${job.title}". Please confirm the payment. Verification code: ${verificationCode}`,
      priority: 'high',
      relatedJob: job._id,
    });

    // TODO: Send SMS with verification code to both parties

    res.json({
      success: true,
      message: 'Payment marked as received. Waiting for customer confirmation.',
      data: {
        job,
        verificationCode, // In production, don't send this in response
      },
    });
  } catch (error) {
    console.error('Error marking payment received:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark payment as received',
      error: error.message,
    });
  }
});

// Customer confirms payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { jobId, tipAmount, verificationCode } = req.body;
    const userId = req.user._id;

    const job = await Job.findById(jobId).populate('professional');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Verify code if provided
    if (verificationCode && job.cashPaymentDetails?.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    if (!job.cashPaymentDetails) {
      job.cashPaymentDetails = {};
    }

    // Store tip amount if provided
    const tip = parseFloat(tipAmount) || 0;
    if (tip > 0) {
      job.tipAmount = tip;
      job.finalPrice = (job.finalPrice || 0) + tip;
    }

    job.cashPaymentDetails.customerConfirmed = true;
    job.cashPaymentDetails.customerConfirmedAt = new Date();
    
    // For cash payments, customer confirmation is sufficient to verify
    // (Professional already selected cash when completing the job)
    if (job.paymentMethod === 'cash') {
      job.paymentStatus = 'cash_verified';
    } else if (job.cashPaymentDetails.professionalMarkedReceived && job.cashPaymentDetails.customerConfirmed) {
      // For other payment methods, require both confirmations
      job.paymentStatus = 'payment_confirmed';
    }

    await job.save();

    // Send notification to professional
    const tipMessage = tip > 0 ? ` (includes ₹${tip} tip)` : '';
    await Notification.create({
      recipient: job.professional._id,
      recipientModel: 'Professional',
      type: 'payment_confirmed',
      title: 'Payment Confirmed',
      message: `Customer has confirmed payment of ₹${job.finalPrice} for job "${job.title}"${tipMessage}. Transaction complete.`,
      priority: 'medium',
      relatedJob: job._id,
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
});

// Upload receipt photo
router.post('/upload-receipt/:jobId', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    const userType = req.userType;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify authorization
    const isAuthorized = 
      (userType === 'professional' && job.professional.toString() === userId) ||
      (userType === 'user' && job.user.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!job.cashPaymentDetails) {
      job.cashPaymentDetails = { receiptPhotos: [] };
    }

    if (!job.cashPaymentDetails.receiptPhotos) {
      job.cashPaymentDetails.receiptPhotos = [];
    }

    // Add receipt photo
    job.cashPaymentDetails.receiptPhotos.push({
      url: `/uploads/receipts/${req.file.filename}`,
      uploadedBy: userType === 'professional' ? 'professional' : 'customer',
      uploadedAt: new Date(),
    });

    await job.save();

    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: {
        receiptUrl: `/uploads/receipts/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload receipt',
      error: error.message,
    });
  }
});

// Raise payment dispute
router.post('/raise-dispute', authenticateToken, async (req, res) => {
  try {
    const { jobId, reason } = req.body;
    const userId = req.user._id;
    const userType = req.userType;

    const job = await Job.findById(jobId).populate('user professional');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify authorization
    const isAuthorized = 
      (userType === 'professional' && job.professional._id.toString() === userId) ||
      (userType === 'user' && job.user._id.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!job.cashPaymentDetails) {
      job.cashPaymentDetails = {};
    }

    job.cashPaymentDetails.disputeRaised = true;
    job.cashPaymentDetails.disputeDetails = {
      raisedBy: userType === 'professional' ? 'professional' : 'customer',
      reason,
      raisedAt: new Date(),
      status: 'pending',
    };

    await job.save();

    // Notify the other party
    const otherParty = userType === 'professional' ? job.user : job.professional;
    const otherPartyModel = userType === 'professional' ? 'User' : 'Professional';

    await Notification.create({
      recipient: otherParty._id,
      recipientModel: otherPartyModel,
      type: 'payment_dispute',
      title: 'Payment Dispute Raised',
      message: `A payment dispute has been raised for job "${job.title}". Our support team will review this case.`,
      priority: 'high',
      relatedJob: job._id,
    });

    // TODO: Notify admin/support team

    res.json({
      success: true,
      message: 'Dispute raised successfully. Our support team will review this case.',
      data: { job },
    });
  } catch (error) {
    console.error('Error raising dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to raise dispute',
      error: error.message,
    });
  }
});

// Get payment status
router.get('/status/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    const userType = req.userType;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify authorization
    const isAuthorized = 
      (userType === 'professional' && job.professional.toString() === userId) ||
      (userType === 'user' && job.user.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: job.paymentStatus,
        paymentMethod: job.paymentMethod,
        cashPaymentDetails: job.cashPaymentDetails,
        finalPrice: job.finalPrice,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message,
    });
  }
});

export default router;
