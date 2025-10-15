import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import razorpay from '../config/razorpay.js';
import Professional from '../models/Professional.js';
import Job from '../models/Job.js';
import Payout from '../models/Payout.js';
import Notification from '../models/Notification.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

// Bank verification helper functions
const verifyBankAccount = async (bankDetails) => {
  try {
    // Create fund account for verification
    const fundAccount = await razorpay.fundAccount.create({
      account_type: 'bank_account',
      bank_account: {
        name: bankDetails.accountHolderName,
        ifsc: bankDetails.ifscCode,
        account_number: bankDetails.accountNumber,
      },
    });

    // Perform fund account validation (penny testing)
    const validation = await razorpay.fundAccount.validationCreate({
      fund_account: {
        account_type: 'bank_account',
        bank_account: {
          name: bankDetails.accountHolderName,
          ifsc: bankDetails.ifscCode,
          account_number: bankDetails.accountNumber,
        },
      },
      amount: 100, // 1 rupee for verification
      currency: 'INR',
      notes: {
        purpose: 'Bank account verification',
      },
    });

    return {
      success: true,
      verificationId: validation.id,
      status: validation.status,
      fundAccountId: fundAccount.id,
    };
  } catch (error) {
    console.error('Bank verification error:', error);
    return {
      success: false,
      error: error.message || 'Bank verification failed',
    };
  }
};

const checkVerificationStatus = async (verificationId) => {
  try {
    const validation = await razorpay.fundAccount.validationFetch(verificationId);
    return {
      success: true,
      status: validation.status,
      results: validation.results,
    };
  } catch (error) {
    console.error('Verification status check error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `professional-${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/professional/profile
// @desc    Get current professional profile
// @access  Private (Professional only)
router.get('/profile', authenticate, authorize('professional'), async (req, res) => {
  try {
    const professional = await Professional.findById(req.user._id).select('-password');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    res.json({
      success: true,
      data: { professional },
    });
  } catch (error) {
    console.error('Get professional profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
});

// @route   PUT /api/professional/profile
// @desc    Update professional profile
// @access  Private (Professional only)
router.put('/profile', [
  authenticate,
  authorize('professional'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('hourlyRate').optional().isNumeric().withMessage('Hourly rate must be a number'),
  body('services').optional().isArray().withMessage('Services must be an array'),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isIn([
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ]).withMessage('State must be in India'),
  body('zipCode').optional().trim().isPostalCode('IN').withMessage('Please provide a valid Indian pincode'),
  validateRequest,
], async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, hourlyRate, services, city, zipCode, address } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (hourlyRate) updateData.hourlyRate = hourlyRate;
    if (services) updateData.services = services;
    if (city) updateData.city = city;
    if (zipCode) updateData.zipCode = zipCode;
    if (address) updateData.address = address;

    if (req.body.location?.coordinates?.lat && req.body.location?.coordinates?.lng) {
      const { lat, lng } = req.body.location.coordinates;
      updateData.locationPoint = { type: 'Point', coordinates: [lng, lat] };
    }

    const professional = await Professional.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { professional },
    });
  } catch (error) {
    console.error('Update professional profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
});

// @route   GET /api/professional/dashboard-stats
// @desc    Get professional dashboard statistics
// @access  Private (Professional only)
router.get('/dashboard-stats', authenticate, authorize('professional'), async (req, res) => {
  try {
    const professionalId = req.user._id;

    // Get job statistics
    const [
      activeJobs,
      pendingJobs,
      completedJobs,
      totalJobs,
      unreadNotifications
    ] = await Promise.all([
      Job.countDocuments({ professional: professionalId, status: 'in_progress' }),
      Job.countDocuments({ professional: professionalId, status: 'accepted' }),
      Job.countDocuments({ professional: professionalId, status: 'completed' }),
      Job.countDocuments({ professional: professionalId }),
      Notification.countDocuments({ recipient: professionalId, isRead: false })
    ]);

    // Calculate total earnings (provider earnings after commission)
    const completedJobsWithCommission = await Job.find({
      professional: professionalId,
      status: 'completed',
      'commission.providerEarnings': { $exists: true }
    }).select('commission.providerEarnings finalPrice');

    const totalEarnings = completedJobsWithCommission.reduce((sum, job) => {
      // Use provider earnings if available, fallback to full finalPrice for legacy jobs
      return sum + (job.commission?.providerEarnings || job.finalPrice || 0);
    }, 0);

    // Get average rating
    const ratedJobs = await Job.find({
      professional: professionalId,
      status: 'completed',
      rating: { $exists: true }
    }).select('rating');

    const averageRating = ratedJobs.length > 0
      ? ratedJobs.reduce((sum, job) => sum + job.rating, 0) / ratedJobs.length
      : 0;

    // Get this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthJobs = await Job.find({
      professional: professionalId,
      status: 'completed',
      completedAt: { $gte: startOfMonth },
      $or: [
        { 'commission.providerEarnings': { $exists: true } },
        { finalPrice: { $exists: true } }
      ]
    }).select('commission.providerEarnings finalPrice');

    const monthlyEarnings = thisMonthJobs.reduce((sum, job) => {
      // Use provider earnings if available, fallback to full finalPrice for legacy jobs
      return sum + (job.commission?.providerEarnings || job.finalPrice || 0);
    }, 0);

    const stats = {
      activeJobs,
      pendingJobs,
      completedJobs,
      totalJobs,
      totalEarnings,
      monthlyEarnings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: ratedJobs.length,
      unreadNotifications,
      memberSince: req.user.createdAt,
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Professional dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
    });
  }
});

// @route   GET /api/professional/jobs
// @desc    Get professional's jobs
// @access  Private (Professional only)
router.get('/jobs', authenticate, authorize('professional'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { professional: req.user._id };
    if (status) {
      filter.status = status;
    }

    // Always use simple query for professional's own jobs
    // Geospatial matching is only needed for discovering new jobs
    const jobs = await Job.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
        },
      },
    });

  } catch (error) {
    console.error('Get professional jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
    });
  }
});

// @route   GET /api/professional/available-jobs
// @desc    Get available jobs for professional
// @access  Private (Professional only)
router.get('/available-jobs', authenticate, authorize('professional'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const professional = await Professional.findById(req.user._id);

    if (!professional.city) {
      return res.status(400).json({
        success: false,
        message: 'Please set your city in profile settings to see available jobs'
      });
    }

    // Simple city-based matching only, excluding jobs declined by this professional
    const filter = {
      status: 'pending',
      category: { $in: professional.services },
      professional: null,
      'location.city': professional.city,
      declinedBy: { $ne: req.user._id } // Exclude jobs this professional has declined
    };

    const jobs = await Job.find(filter)
      .populate('user', 'firstName lastName email phone rating.average')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(filter);

    console.log('=== BACKEND: Available jobs (City-based matching) ===');
    console.log('Jobs found:', jobs.length);
    console.log('Professional city:', professional.city);
    console.log('Professional services:', professional.services);
    console.log('Job details:', jobs.map(j => ({
      id: j._id,
      title: j.title,
      city: j.location?.city,
      category: j.category,
      status: j.status,
      budget: j.budget,
      estimatedDuration: j.estimatedDuration
    })));
    console.log('==========================================');

    res.json({
      success: true,
      data: {
        jobs: jobs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
        },
      },
    });
  } catch (error) {
    console.error('Get available jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available jobs',
    });
  }
});

// @route   POST /api/professional/jobs/:id/accept
// @desc    Accept a job
// @access  Private (Professional only)
router.post('/jobs/:id/accept', authenticate, authorize('professional'), async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      status: 'pending',
      professional: null
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or already assigned',
      });
    }

    // Check if professional provides this service
    const professional = await Professional.findById(req.user._id);
    if (!professional.services.includes(job.category)) {
      return res.status(400).json({ success: false, message: 'You do not provide this service' });
    }

    // Check if professional is already busy with another job
    if (professional.isBusy) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are currently busy with another job. Please complete it before accepting new jobs.' 
      });
    }

    // Enforce locality match (pincode preferred; fallback to city)
    // Locality enforcement switched to city-only
    const cityOk = professional.city && job.location?.city && professional.city === job.location.city;
    if (!cityOk) {
      return res.status(403).json({ success: false, message: 'You can only accept jobs in your city' });
    }

    job.professional = req.user._id;
    job.status = 'accepted';
    await job.save();

    // Mark professional as busy
    professional.isBusy = true;
    professional.currentJob = job._id;
    await professional.save();

    // Notify the user with professional contact details
    await Notification.createNotification({
      recipient: job.user,
      recipientModel: 'User',
      type: 'job_accepted',
      title: 'Job Accepted',
      message: `${professional.firstName} ${professional.lastName} has accepted your job "${job.title}". Contact: ${professional.phone}, Email: ${professional.email}`,
      relatedJob: job._id,
      relatedUser: req.user._id,
      relatedUserModel: 'Professional',
    });

    // Populate both user and professional data with contact details
    await job.populate('user', 'firstName lastName email phone address');
    await job.populate('professional', 'firstName lastName email phone city zipCode');

    res.json({
      success: true,
      message: 'Job accepted successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting job',
    });
  }
});

// @route   POST /api/professional/jobs/:id/decline
// @desc    Decline a job
// @access  Private (Professional only)
router.post('/jobs/:id/decline', authenticate, authorize('professional'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Only allow declining pending jobs
    if (job.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only decline pending jobs' 
      });
    }

    // Add professional to declinedBy array if not already there
    if (!job.declinedBy.includes(req.user._id)) {
      job.declinedBy.push(req.user._id);
      await job.save();
    }
    
    res.json({
      success: true,
      message: 'Job declined successfully',
    });
  } catch (error) {
    console.error('Decline job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining job',
    });
  }
});

// @route   POST /api/professional/jobs/:id/start
// @desc    Start an accepted job (move to in_progress)
// @access  Private (Professional only)
router.post('/jobs/:id/start', authenticate, authorize('professional'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, professional: req.user._id, status: 'accepted' });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or cannot be started' });

    // Enforce schedule window: allow starting on the scheduled date (same day) or later
    const now = new Date();
    const schedDate = new Date(job.scheduledDate);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfSched = new Date(schedDate.getFullYear(), schedDate.getMonth(), schedDate.getDate());
    if (startOfToday < startOfSched) {
      return res.status(400).json({ success: false, message: 'You can only start the job on or after the scheduled date' });
    }

    // Optional geofence: ensure job is within professional's radius (if both have points)
    const pro = await Professional.findById(req.user._id);
    if (pro.locationPoint?.coordinates?.length === 2 && job.locationPoint?.coordinates?.length === 2) {
      const [proLng, proLat] = pro.locationPoint.coordinates;
      const [jobLng, jobLat] = job.locationPoint.coordinates;
      const toRad = (d) => d * Math.PI / 180;
      const R = 6371000; // meters
      const dLat = toRad(jobLat - proLat);
      const dLng = toRad(jobLng - proLng);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(proLat)) * Math.cos(toRad(jobLat)) * Math.sin(dLng/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // meters
      const maxMeters = (pro.serviceArea?.radius || 10) * 1000;
      if (distance > maxMeters) {
        return res.status(400).json({ success: false, message: 'Job is outside your service radius' });
      }
    }

    job.status = 'in_progress';
    await job.save();

    await Notification.createNotification({
      recipient: job.user,
      recipientModel: 'User',
      type: 'job_started',
      title: 'Job Started',
      message: `Your professional has started the job "${job.title}"`,
      relatedJob: job._id,
      relatedUser: req.user._id,
      relatedUserModel: 'Professional',
    });

    res.json({ success: true, message: 'Job started successfully', data: { job } });
  } catch (error) {
    console.error('Start job error:', error);
    res.status(500).json({ success: false, message: 'Error starting job' });
  }
});

// @route   POST /api/professional/jobs/:id/complete
// @desc    Complete an in-progress job (move to completed)
// @access  Private (Professional only)
router.post('/jobs/:id/complete', authenticate, authorize('professional'), async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      professional: req.user._id, 
      status: { $in: ['accepted', 'in_progress'] } 
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or cannot be completed' });
    }

    // Accept finalPrice and paymentMethod in body (required for commission calculation)
    const { finalPrice, paymentMethod = 'online' } = req.body || {};
    if (finalPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Final price is required for completion' });
    }

    const priceNum = Number(finalPrice);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Invalid final price' });
    }

    // Validate final price is within budget range
    if (job.budget && job.budget.min && priceNum < job.budget.min) {
      return res.status(400).json({ success: false, message: 'Final price cannot be below minimum budget' });
    }
    if (job.budget && job.budget.max && priceNum > job.budget.max) {
      return res.status(400).json({ success: false, message: 'Final price cannot exceed maximum budget' });
    }

    // Calculate commission based on payment method
    const isCashPayment = paymentMethod === 'cash';
    const commissionRate = isCashPayment ? 0 : 0.10; // 0% for cash, 10% for online
    const companyFee = Math.round(priceNum * commissionRate * 100) / 100; // Round to 2 decimal places
    const providerEarnings = Math.round((priceNum - companyFee) * 100) / 100;
    
    job.finalPrice = priceNum;
    job.commission = {
      total: priceNum,
      companyFee: companyFee,
      providerEarnings: providerEarnings,
      commissionRate: commissionRate,
      paymentMethod: paymentMethod
    };
    job.paymentMethod = paymentMethod;

    job.status = 'completed';
    job.completedAt = new Date();
    
    // Set payment status based on payment method
    // For cash payments, use dual confirmation flow
    if (isCashPayment) {
      job.paymentStatus = 'cash_pending';
      // Initialize cash payment details for dual confirmation
      if (!job.cashPaymentDetails) {
        job.cashPaymentDetails = {};
      }
      job.cashPaymentDetails.amount = priceNum;
      job.cashPaymentDetails.professionalMarkedReceived = false;
      job.cashPaymentDetails.customerConfirmed = false;
    } else {
      job.paymentStatus = 'pending';
    }
    
    await job.save();

    // Mark professional as available again
    const professional = await Professional.findById(req.user._id);
    professional.isBusy = false;
    professional.currentJob = null;
    await professional.save();

    // Populate professional data for notification
    await job.populate('professional', 'firstName lastName');

    // Notify the user that the job has been completed
    await Notification.createNotification({
      recipient: job.user,
      recipientModel: 'User',
      type: 'job_completed',
      title: 'Job Completed Successfully',
      message: `${job.professional.firstName} ${job.professional.lastName} has completed your job "${job.title}". ${isCashPayment ? 'Please confirm the cash payment once received.' : 'Please make payment online.'}`,
      relatedJob: job._id,
      relatedUser: req.user._id,
      relatedUserModel: 'Professional',
    });

    // Create a payment notification based on payment method
    if (isCashPayment) {
      await Notification.createNotification({
        recipient: job.user,
        recipientModel: 'User',
        type: 'payment_confirmation_required',
        title: 'Cash Payment Confirmation Required',
        message: `Please confirm the cash payment of ₹${priceNum.toFixed(2)} for job "${job.title}" once you've made the payment to the professional.`,
        relatedJob: job._id,
        relatedUser: req.user._id,
        relatedUserModel: 'Professional',
        priority: 'high',
        actionUrl: '/dashboard?tab=jobs',
        actionData: { jobId: job._id, amount: priceNum, type: 'cash_payment_confirmation' }
      });
    } else {
      await Notification.createNotification({
        recipient: job.user,
        recipientModel: 'User',
        type: 'payment_due',
        title: 'Payment Due',
        message: `Payment of ₹${priceNum.toFixed(2)} is due for job "${job.title}". Your provider will receive ₹${providerEarnings.toFixed(2)} after platform fees.`,
        relatedJob: job._id,
        relatedUser: req.user._id,
        relatedUserModel: 'Professional',
        priority: 'high',
        actionUrl: '/dashboard?tab=payments',
        actionData: { jobId: job._id, amount: priceNum, type: 'payment_due' }
      });
    }

    res.json({ 
      success: true, 
      message: `Job completed successfully! You will earn ₹${providerEarnings.toFixed(2)} after commission.`, 
      data: { 
        job,
        earnings: {
          totalAmount: priceNum,
          companyFee: companyFee,
          yourEarnings: providerEarnings
        }
      } 
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ success: false, message: 'Error completing job' });
  }
});

// @route   GET /api/professional/notifications
// @desc    Get professional notifications
// @access  Private (Professional only)
router.get('/notifications', authenticate, authorize('professional'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedJob', 'title status')
      .populate('relatedUser', 'firstName lastName');

    const totalNotifications = await Notification.countDocuments({ recipient: req.user._id });
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          totalNotifications,
          unreadCount,
        },
      },
    });
  } catch (error) {
    console.error('Get professional notifications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// @route   PUT /api/professional/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Professional only)
router.put('/notifications/:id/read', authenticate, authorize('professional'), async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: 'Error marking notification as read' });
  }
});

// @route   PUT /api/professional/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private (Professional only)
router.put('/notifications/mark-all-read', authenticate, authorize('professional'), async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Error marking notifications as read' });
  }
});



// @route   PUT /api/professional/availability
// @desc    Update professional availability status
// @access  Private (Professional only)
router.put('/availability', [
  authenticate,
  authorize('professional'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  validateRequest,
], async (req, res) => {
  try {
    const { isActive } = req.body;

    const professional = await Professional.findByIdAndUpdate(
      req.user._id,
      { isActive },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: `You are now ${isActive ? 'available' : 'unavailable'} for jobs`,
      data: { professional },
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
    });
  }
});

// @route   GET /api/professional/jobs/assigned
// @desc    Get all jobs assigned to the professional
// @access  Private (Professional only)
router.get('/jobs/assigned', authenticate, authorize('professional'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { professional: req.user._id };

    const jobs = await Job.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
        },
      },
    });
  } catch (error) {
    console.error('Get assigned jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned jobs',
    });
  }
});

// @route   GET /api/professional/debug/jobs
// @desc    Debug endpoint to check job matching
// @access  Private (Professional only)
router.get('/debug/jobs', authenticate, authorize('professional'), async (req, res) => {
  try {
    const professional = await Professional.findById(req.user._id);
    
    // Get all pending jobs
    const allPendingJobs = await Job.find({ status: 'pending', professional: null })
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get jobs matching professional's services
    const serviceMatchingJobs = await Job.find({
      status: 'pending',
      category: { $in: professional.services },
      professional: null
    })
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get jobs matching professional's city
    const cityMatchingJobs = await Job.find({
      status: 'pending',
      'location.city': professional.city,
      professional: null
    })
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get jobs matching both services and city
    const fullyMatchingJobs = await Job.find({
      status: 'pending',
      category: { $in: professional.services },
      'location.city': professional.city,
      professional: null
    })
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        professional: {
          _id: professional._id,
          services: professional.services,
          city: professional.city,
          zipCode: professional.zipCode,
          locationPoint: professional.locationPoint,
          serviceArea: professional.serviceArea
        },
        debug: {
          allPendingJobs: allPendingJobs.length,
          serviceMatchingJobs: serviceMatchingJobs.length,
          cityMatchingJobs: cityMatchingJobs.length,
          fullyMatchingJobs: fullyMatchingJobs.length,
          sampleJobs: fullyMatchingJobs.slice(0, 5)
        }
      }
    });
  } catch (error) {
    console.error('Debug jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error debugging jobs',
    });
  }
});

// @route   PUT /api/professional/bank-account
// @desc    Update bank account details
// @access  Private (Professional only)
router.put('/bank-account', [
  authenticate,
  authorize('professional'),
  body('accountHolderName').trim().isLength({ min: 2, max: 100 }).withMessage('Account holder name must be between 2 and 100 characters'),
  body('accountNumber').trim().isLength({ min: 8, max: 20 }).withMessage('Account number must be between 8 and 20 characters'),
  body('ifscCode').trim().isLength({ min: 11, max: 11 }).withMessage('IFSC code must be exactly 11 characters'),
  body('bankName').trim().isLength({ min: 2, max: 100 }).withMessage('Bank name must be between 2 and 100 characters'),
  body('branchName').optional().trim().isLength({ max: 100 }).withMessage('Branch name cannot exceed 100 characters'),
  body('accountType').isIn(['savings', 'current']).withMessage('Account type must be savings or current'),
  validateRequest,
], async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, branchName, accountType } = req.body;
    
    // Prepare bank account data
    const bankAccountData = {
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
      branchName,
      accountType,
      isVerified: false,
      verificationStatus: 'pending',
      lastVerificationAttempt: new Date(),
      addedAt: new Date(),
    };

    // Attempt bank verification
    console.log('Starting bank verification for:', accountHolderName);
    const verificationResult = await verifyBankAccount({
      accountHolderName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
    });

    if (verificationResult.success) {
      bankAccountData.verificationId = verificationResult.verificationId;
      bankAccountData.fundAccountId = verificationResult.fundAccountId;
      bankAccountData.verificationStatus = verificationResult.status === 'completed' ? 'completed' : 'pending';
      bankAccountData.isVerified = verificationResult.status === 'completed';
      
      console.log('Bank verification initiated successfully:', verificationResult.verificationId);
    } else {
      bankAccountData.verificationStatus = 'failed';
      bankAccountData.verificationError = verificationResult.error;
      console.log('Bank verification failed:', verificationResult.error);
    }

    const professional = await Professional.findByIdAndUpdate(
      req.user._id,
      { bankAccount: bankAccountData },
      { new: true, runValidators: true }
    ).select('-password');

    // Create notification about bank account update
    await Notification.createNotification({
      recipient: req.user._id,
      recipientModel: 'Professional',
      type: 'bank_account_updated',
      title: 'Bank Account Updated',
      message: 'Bank account details have been updated successfully.',
      priority: 'medium',
    });

    // Create verification status notification
    if (verificationResult.success) {
      if (bankAccountData.verificationStatus === 'completed') {
        await Notification.createNotification({
          recipient: req.user._id,
          recipientModel: 'Professional',
          type: 'bank_verification_completed',
          title: 'Bank Account Verified',
          message: 'Your bank account has been successfully verified! You can now request payouts.',
          priority: 'high',
        });
      } else {
        await Notification.createNotification({
          recipient: req.user._id,
          recipientModel: 'Professional',
          type: 'bank_verification_pending',
          title: 'Bank Verification In Progress',
          message: 'Bank account verification is in progress. This may take a few minutes to complete.',
          priority: 'medium',
        });
      }
    } else {
      await Notification.createNotification({
        recipient: req.user._id,
        recipientModel: 'Professional',
        type: 'bank_verification_failed',
        title: 'Bank Verification Failed',
        message: `Bank account verification failed: ${verificationResult.error || 'Please check your account details and try again.'}`,
        priority: 'high',
      });
    }

    res.json({
      success: true,
      message: 'Bank account details updated successfully',
      data: { 
        professional,
        verification: {
          status: bankAccountData.verificationStatus,
          verificationId: bankAccountData.verificationId,
          error: bankAccountData.verificationError,
        }
      },
    });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank account details',
    });
  }
});

// @route   POST /api/professional/verify-bank-account
// @desc    Manually retry bank account verification
// @access  Private (Professional only)
router.post('/verify-bank-account', [
  authenticate,
  authorize('professional'),
], async (req, res) => {
  try {
    const professional = await Professional.findById(req.user._id);
    
    if (!professional || !professional.bankAccount || !professional.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details not found',
      });
    }

    const bankAccount = professional.bankAccount;
    
    // Check if already verified
    if (bankAccount.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Bank account is already verified',
      });
    }

    // Attempt verification
    const verificationResult = await verifyBankAccount({
      accountHolderName: bankAccount.accountHolderName,
      accountNumber: bankAccount.accountNumber,
      ifscCode: bankAccount.ifscCode,
      bankName: bankAccount.bankName,
    });

    // Update verification details
    const updateData = {
      'bankAccount.lastVerificationAttempt': new Date(),
    };

    if (verificationResult.success) {
      updateData['bankAccount.verificationId'] = verificationResult.verificationId;
      updateData['bankAccount.fundAccountId'] = verificationResult.fundAccountId;
      updateData['bankAccount.verificationStatus'] = verificationResult.status === 'completed' ? 'completed' : 'pending';
      updateData['bankAccount.isVerified'] = verificationResult.status === 'completed';
      updateData['bankAccount.verificationError'] = undefined;
    } else {
      updateData['bankAccount.verificationStatus'] = 'failed';
      updateData['bankAccount.verificationError'] = verificationResult.error;
    }

    const updatedProfessional = await Professional.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Create appropriate notification based on verification result
    if (verificationResult.success) {
      if (verificationResult.status === 'completed') {
        await Notification.createNotification({
          recipient: req.user._id,
          recipientModel: 'Professional',
          type: 'bank_verification_completed',
          title: 'Bank Account Verified',
          message: 'Your bank account has been successfully verified! You can now request payouts.',
          priority: 'high',
        });
      } else {
        await Notification.createNotification({
          recipient: req.user._id,
          recipientModel: 'Professional',
          type: 'bank_verification_pending',
          title: 'Bank Verification Retry In Progress',
          message: 'Bank account verification retry is in progress. We will notify you once it is completed.',
          priority: 'medium',
        });
      }
    } else {
      await Notification.createNotification({
        recipient: req.user._id,
        recipientModel: 'Professional',
        type: 'bank_verification_failed',
        title: 'Bank Verification Retry Failed',
        message: `Bank account verification retry failed: ${verificationResult.error || 'Please check your account details and try again.'}`,
        priority: 'high',
      });
    }

    res.json({
      success: true,
      message: verificationResult.success ? 'Verification initiated successfully' : 'Verification failed',
      data: { 
        professional: updatedProfessional,
        verification: {
          status: verificationResult.success ? (verificationResult.status || 'pending') : 'failed',
          verificationId: verificationResult.verificationId,
          error: verificationResult.error,
        }
      },
    });
  } catch (error) {
    console.error('Manual bank verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during bank verification',
    });
  }
});

// @route   GET /api/professional/bank-verification-status
// @desc    Check bank account verification status
// @access  Private (Professional only)
router.get('/bank-verification-status', [
  authenticate,
  authorize('professional'),
], async (req, res) => {
  try {
    const professional = await Professional.findById(req.user._id).select('bankAccount');
    
    if (!professional || !professional.bankAccount || !professional.bankAccount.verificationId) {
      return res.status(400).json({
        success: false,
        message: 'No verification in progress',
      });
    }

    const verificationId = professional.bankAccount.verificationId;
    const statusResult = await checkVerificationStatus(verificationId);

    if (statusResult.success) {
      // Update status if changed
      const updateData = {};
      if (statusResult.status === 'completed' && !professional.bankAccount.isVerified) {
        updateData['bankAccount.isVerified'] = true;
        updateData['bankAccount.verificationStatus'] = 'completed';
        
        // Create notification for successful verification
        await Notification.createNotification({
          recipient: req.user._id,
          recipientModel: 'Professional',
          type: 'bank_verification_completed',
          title: 'Bank Account Verified Successfully',
          message: 'Great news! Your bank account has been successfully verified. You can now request payouts for your completed jobs.',
          priority: 'high',
        });
      } else if (statusResult.status === 'failed') {
        updateData['bankAccount.verificationStatus'] = 'failed';
        updateData['bankAccount.verificationError'] = 'Verification failed';
        
        // Create notification for failed verification
        await Notification.createNotification({
          recipient: req.user._id,
          recipientModel: 'Professional',
          type: 'bank_verification_failed',
          title: 'Bank Verification Failed',
          message: 'Bank account verification failed. Please check your account details and try again, or contact support if the problem persists.',
          priority: 'high',
        });
      }

      if (Object.keys(updateData).length > 0) {
        await Professional.findByIdAndUpdate(req.user._id, updateData);
      }

      res.json({
        success: true,
        data: {
          status: statusResult.status,
          results: statusResult.results,
          isVerified: statusResult.status === 'completed',
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Error checking verification status',
        error: statusResult.error,
      });
    }
  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking verification status',
    });
  }
});

// @route   POST /api/professional/request-payout
// @desc    Request payout
// @access  Private (Professional only)
router.post('/request-payout', [
  authenticate,
  authorize('professional'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  validateRequest,
], async (req, res) => {
  try {
    const { amount, notes } = req.body;
    const professionalId = req.user._id;

    // Get professional with bank account details
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    // Check if bank account details are provided
    if (!professional.bankAccount || !professional.bankAccount.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Bank account details are required for payouts',
      });
    }
    // Calculate available earnings
    const completedJobsWithCommission = await Job.find({
      professional: professionalId,
      status: 'completed',
      'commission.providerEarnings': { $exists: true }
    }).select('commission.providerEarnings finalPrice paymentMethod paymentStatus');

    const totalEarnings = completedJobsWithCommission.reduce((sum, job) => {
      // For cash payments, only count if verified by both parties
      if (job.paymentMethod === 'cash') {
        // Only count cash payments that are verified
        if (job.paymentStatus === 'cash_verified') {
          return sum + job.finalPrice;
        }
        return sum;
      }
      // For online payments, use provider earnings after commission
      return sum + (job.commission?.providerEarnings || 0);
    }, 0);

    // Check previous payouts
    const previousPayouts = await Payout.find({
      professional: professionalId,
      status: { $in: ['pending', 'processing', 'completed'] }
    }).select('amount');

    const totalPaidOut = previousPayouts.reduce((sum, payout) => sum + payout.amount, 0);
    const availableBalance = totalEarnings - totalPaidOut;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`,
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payout amount is ₹100',
      });
    }

    // Check for pending payout requests
    const pendingPayout = await Payout.findOne({
      professional: professionalId,
      status: { $in: ['pending', 'processing'] }
    });

    if (pendingPayout) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending payout request',
      });
    }

    // Create payout request
    const payout = new Payout({
      professional: professionalId,
      amount: amount,
      bankAccount: {
        accountHolderName: professional.bankAccount.accountHolderName,
        accountNumber: professional.bankAccount.accountNumber,
        ifscCode: professional.bankAccount.ifscCode,
        bankName: professional.bankAccount.bankName,
        branchName: professional.bankAccount.branchName,
        accountType: professional.bankAccount.accountType,
      },
      notes: notes,
      status: 'pending',
    });

    await payout.save();

    // Create notification for admin (if needed)
    await Notification.createNotification({
      recipient: professionalId,
      recipientModel: 'Professional',
      type: 'payout_requested',
      title: 'Payout Request Submitted',
      message: `Your payout request for ₹${amount.toFixed(2)} has been submitted and is being processed.`,
      relatedUser: professionalId,
      relatedUserModel: 'Professional',
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: { payout },
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payout request',
    });
  }
});

// @route   GET /api/professional/payouts
// @desc    Get professional's payout history
// @access  Private (Professional only)
router.get('/payouts', authenticate, authorize('professional'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payouts = await Payout.find({ professional: req.user._id })
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPayouts = await Payout.countDocuments({ professional: req.user._id });

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPayouts / limit),
          totalPayouts,
        },
      },
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout history',
    });
  }
});

// @route   GET /api/professional/payout-balance
// @desc    Get available payout balance
// @access  Private (Professional only)
router.get('/payout-balance', authenticate, authorize('professional'), async (req, res) => {
  try {
    const professionalId = req.user._id;

    // Calculate available earnings (only verified cash payments and paid online payments)
    const completedJobsWithCommission = await Job.find({
      professional: professionalId,
      status: 'completed',
      'commission.providerEarnings': { $exists: true }
    }).select('commission.providerEarnings finalPrice paymentMethod paymentStatus');

    const totalEarnings = completedJobsWithCommission.reduce((sum, job) => {
      // For cash payments, only count if verified by both parties
      if (job.paymentMethod === 'cash') {
        if (job.paymentStatus === 'cash_verified') {
          return sum + job.finalPrice;
        }
        return sum;
      }
      // For online payments, use provider earnings after commission
      return sum + (job.commission?.providerEarnings || 0);
    }, 0);

    // Calculate total payouts
    const payouts = await Payout.find({
      professional: professionalId,
      status: { $in: ['pending', 'processing', 'completed'] }
    }).select('amount status');

    const totalPaidOut = payouts.reduce((sum, payout) => sum + payout.amount, 0);
    const pendingAmount = payouts
      .filter(p => ['pending', 'processing'].includes(p.status))
      .reduce((sum, payout) => sum + payout.amount, 0);

    const availableBalance = totalEarnings - totalPaidOut;

    res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings,
        totalPaidOut: totalPaidOut,
        pendingAmount: pendingAmount,
        availableBalance: availableBalance,
        minimumPayout: 100,
      },
    });
  } catch (error) {
    console.error('Get payout balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout balance',
    });
  }
});

// @route   POST /api/professional/profile/image
// @desc    Upload professional profile image
// @access  Private (Professional only)
router.post('/profile/image', authenticate, authorize('professional'), upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Delete old profile image if it exists
    const professional = await Professional.findById(req.user._id);
    if (professional.profileImage) {
      const oldImagePath = path.join(process.cwd(), 'uploads', 'profiles', path.basename(professional.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update professional profile with new image URL
    const updatedProfessional = await Professional.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: imageUrl,
        professional: updatedProfessional,
      },
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading profile image',
    });
  }
});

export default router;
