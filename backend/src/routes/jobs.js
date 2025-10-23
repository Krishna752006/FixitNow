import express from 'express';
import { body, param } from 'express-validator';
import Job from '../models/Job.js';
import Professional from '../models/Professional.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation rules for job creation
const jobValidation = [
  body('category').isIn(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other']),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
];

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (User only)
router.post('/', [
  authenticate,
  authorize('user'),
  ...jobValidation,
  validateRequest,
], async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      user: req.user._id,
    };

    // Log the incoming job data for debugging
    console.log('=== Creating new job ===');
    console.log('Title:', jobData.title);
    console.log('Category:', jobData.category);
    console.log('Budget:', jobData.budget);
    console.log('Estimated Duration:', jobData.estimatedDuration);
    console.log('========================');

    // Normalize GeoJSON point if coordinates present
    if (jobData.location?.coordinates?.lat && jobData.location?.coordinates?.lng) {
      const { lat, lng } = jobData.location.coordinates;
      jobData.locationPoint = { type: 'Point', coordinates: [lng, lat] };
      console.log('Job coordinates set:', { lat, lng });
    } else if (jobData.location?.coordinates?.latitude && jobData.location?.coordinates?.longitude) {
      const { latitude, longitude } = jobData.location.coordinates;
      jobData.locationPoint = { type: 'Point', coordinates: [longitude, latitude] };
      console.log('Job coordinates set:', { latitude, longitude });
    } else {
      console.log('No coordinates provided for job location');
    }

    const job = new Job(jobData);
    await job.save();

    // Save new address to user profile if it doesn't exist
    const user = await User.findById(req.user._id);
    if (user && job.location) {
      const addressExists = user.addresses.some(
        (addr) =>
          addr.street === job.location.address &&
          addr.city === job.location.city &&
          addr.state === job.location.state &&
          addr.zipCode === job.location.zipCode
      );

      if (!addressExists) {
        user.addresses.push({
          street: job.location.address,
          city: job.location.city,
          state: job.location.state,
          zipCode: job.location.zipCode,
          country: job.location.country || 'India',
          label: 'Other', // Default label for new addresses
        });
        await user.save();
      }
    }

    // Populate user data
    await job.populate('user', 'firstName lastName email phone');

    // Create notification for nearby professionals (city-based matching)
    const nearbyProfessionals = await Professional.find({
      services: job.category,
      city: job.location.city,
      isActive: true,
    }).limit(10);

    console.log(`Found ${nearbyProfessionals.length} professionals for job in ${job.location.city}`);

    // Create notifications for professionals
    const notificationPromises = nearbyProfessionals.map(professional =>
      Notification.createNotification({
        recipient: professional._id,
        recipientModel: 'Professional',
        type: 'job_created',
        title: 'New Job Available',
        message: `A new ${job.category} job is available in ${job.location.city} (${job.location.zipCode || 'N/A'})`,
        relatedJob: job._id,
        relatedUser: req.user._id,
        relatedUserModel: 'User',
        actionUrl: `/jobs/${job._id}`,
      })
    );

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
    });
  }
});

// @route   GET /api/jobs
// @desc    Get user's jobs
// @access  Private (User only)
router.get('/', authenticate, authorize('user'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate('professional', 'firstName lastName email phone rating services experience city businessName profileImage verificationStatus createdAt bio')
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
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
    });
  }
});

// @route   GET /api/jobs/pending-payment
// @desc    Get user's completed jobs that need payment
// @access  Private (User only)
router.get('/pending-payment', authenticate, authorize('user'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      user: req.user._id,
      status: 'completed',
      paymentStatus: { 
        $in: ['pending', 'cash_pending'] 
      }
    };

    const jobs = await Job.find(filter)
      .populate('professional', 'firstName lastName email phone')
      .sort({ completedAt: -1 })
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
    console.error('Get pending payment jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs pending payment',
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job details
// @access  Private (User or Professional)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('professional', 'firstName lastName email phone rating.average services')
      .populate('user', 'firstName lastName email phone');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Authorization check - user must be job owner or assigned professional
    const isJobOwner = job.user._id.toString() === req.user._id.toString();
    const isAssignedProfessional = job.professional && job.professional._id.toString() === req.user._id.toString();

    if (!isJobOwner && !isAssignedProfessional) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this job',
      });
    }

    res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (User only)
router.put('/:id', [
  authenticate,
  authorize('user'),
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  validateRequest,
], async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Only allow updates if job is pending
    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update job that has been accepted or completed',
      });
    }

    const allowedUpdates = ['title', 'description', 'scheduledDate', 'scheduledTime', 'budget', 'status', 'finalPrice'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle job completion
    if (req.body.status === 'completed') {
      updates.completedAt = new Date();
      if (req.body.finalAmount) {
        updates.finalPrice = req.body.finalAmount;
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('professional', 'firstName lastName');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob },
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Cancel/Delete job
// @access  Private (User only)
router.delete('/:id', [
  authenticate,
  authorize('user'),
  param('id').isMongoId().withMessage('Invalid job id'),
  validateRequest,
], async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (!job.canBeCancelled()) {
      return res.status(400).json({ success: false, message: 'Cannot cancel job in current status' });
    }

    job.status = 'cancelled';
    await job.save();

    if (job.professional) {
      // Free up the professional
      await Professional.findByIdAndUpdate(job.professional, {
        isBusy: false,
        currentJob: null
      });

      await Notification.createNotification({
        recipient: job.professional,
        recipientModel: 'Professional',
        type: 'job_cancelled',
        title: 'Job Cancelled',
        message: `The job "${job.title}" has been cancelled by the customer`,
        relatedJob: job._id,
        relatedUser: req.user._id,
        relatedUserModel: 'User',
      });
    }

    return res.json({ success: true, message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Cancel job error:', error);
    return res.status(500).json({ success: false, message: 'Error cancelling job' });
  }
});

// Alias route: POST /api/jobs/:id/cancel (performs same as DELETE)
// Keeps backward compatibility with older clients calling POST instead of DELETE
router.post('/:id/cancel', authenticate, authorize('user'), async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!job.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel job in current status',
      });
    }

    job.status = 'cancelled';
    await job.save();

    if (job.professional) {
      // Free up the professional
      await Professional.findByIdAndUpdate(job.professional, {
        isBusy: false,
        currentJob: null
      });

      await Notification.createNotification({
        recipient: job.professional,
        recipientModel: 'Professional',
        type: 'job_cancelled',
        title: 'Job Cancelled',
        message: `The job "${job.title}" has been cancelled by the customer`,
        relatedJob: job._id,
        relatedUser: req.user._id,
        relatedUserModel: 'User',
      });
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel job (POST alias) error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling job',
    });
  }
});

// @route   POST /api/jobs/:id/rate
// @desc    Rate completed job
// @access  Private (User only)
router.post('/:id/rate', [
  authenticate,
  authorize('user'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters'),
  validateRequest,
], async (req, res) => {
  try {
    const { rating, review } = req.body;

    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'completed',
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Completed job not found',
      });
    }

    if (job.rating) {
      return res.status(400).json({
        success: false,
        message: 'Job has already been rated',
      });
    }

    job.rating = rating;
    if (review) job.review = review;
    await job.save();

    // Update professional's average rating
    if (job.professional) {
      const professional = await Professional.findById(job.professional);
      if (professional) {
        const allRatings = await Job.find({
          professional: job.professional,
          status: 'completed',
          rating: { $exists: true },
        }).select('rating');

        const totalRating = allRatings.reduce((sum, job) => sum + job.rating, 0);
        const averageRating = totalRating / allRatings.length;

        professional.rating.average = Math.round(averageRating * 10) / 10;
        professional.rating.count = allRatings.length;
        await professional.save();

        // Notify professional
        await Notification.createNotification({
          recipient: job.professional,
          recipientModel: 'Professional',
          type: 'review_received',
          title: 'New Review Received',
          message: `You received a ${rating}-star review for "${job.title}"`,
          relatedJob: job._id,
          relatedUser: req.user._id,
          relatedUserModel: 'User',
        });
      }
    }

    res.json({
      success: true,
      message: 'Job rated successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Rate job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating job',
    });
  }
});

// @route   GET /api/jobs/debug/location
// @desc    Debug endpoint to test location data
// @access  Private (User only)
router.get('/debug/location', authenticate, authorize('user'), async (req, res) => {
  try {
    const { lat, lng, city, zipCode } = req.query;
    
    // Test location data
    const testLocation = {
      address: 'Test Address',
      city: city || 'Mumbai',
      state: 'Maharashtra',
      zipCode: zipCode || '400001',
      coordinates: (lat && lng) ? { lat: parseFloat(String(lat)), lng: parseFloat(String(lng)) } : undefined
    };

    // Test professional matching
    const matchingProfessionals = await Professional.find({
      city: testLocation.city,
      isActive: true,
    }).limit(5);

    res.json({
      success: true,
      data: {
        testLocation,
        matchingProfessionals: matchingProfessionals.length,
        professionals: matchingProfessionals.map(p => ({
          id: p._id,
          name: `${p.firstName} ${p.lastName}`,
          services: p.services,
          city: p.city
        }))
      }
    });
  } catch (error) {
    console.error('Debug location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error debugging location',
    });
  }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Update job status
// @access  Private (User or Professional)
router.patch('/:id/status', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid job ID'),
  body('status')
    .isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes').optional().isString().trim(),
  validateRequest
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check
    if (req.user.role === 'professional' && !job.professional?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    if (req.user.role === 'user' && !job.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Update status
    await job.updateStatus(
      req.body.status,
      req.user._id,
      req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      req.body.notes
    );

    // Create notification for the other party
    const recipient = req.user.role === 'user' ? job.professional : job.user;
    if (recipient) {
      await Notification.create({
        recipient,
        recipientModel: req.user.role === 'user' ? 'Professional' : 'User',
        type: 'job_status_update',
        title: 'Job Status Updated',
        message: `Job #${job._id} status changed to ${req.body.status}`,
        referenceId: job._id,
        referenceModel: 'Job'
      });
    }

    res.json({ 
      message: 'Job status updated successfully',
      status: job.status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs/:id/status-history
// @desc    Get job status history
// @access  Private (User or Professional)
router.get('/:id/status-history', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid job ID'),
  validateRequest
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id, 'statusHistory');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check
    if (req.user.role === 'professional' && !job.professional?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this job' });
    }

    if (req.user.role === 'user' && !job.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this job' });
    }

    res.json({ statusHistory: job.statusHistory });
  } catch (error) {
    console.error('Error fetching status history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/jobs/:id/generate-invoice
// @desc    Generate invoice for completed job
// @access  Private (User or Admin)
router.post('/:id/generate-invoice', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid job ID'),
  validateRequest
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow users and admins to generate invoices
    if (req.user.role !== 'admin' && !job.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to generate invoice for this job' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot generate invoice for incomplete job' });
    }

    const invoice = await job.generateInvoice();
    
    res.json({ 
      message: 'Invoice generated successfully',
      invoice
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

export default router;
