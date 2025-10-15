import express from 'express';
import Review from '../models/Review.js';
import Job from '../models/Job.js';
import Professional from '../models/Professional.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit a review for a completed job
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { jobId, rating, review, categories } = req.body;
    const userId = req.user._id;

    // Validate job exists and is completed
    const job = await Job.findById(jobId).populate('professional');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed jobs',
      });
    }

    if (job.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this job',
      });
    }

    if (!job.professional) {
      return res.status(400).json({
        success: false,
        message: 'No professional assigned to this job',
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ job: jobId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted for this job',
      });
    }

    // Create review
    const newReview = new Review({
      job: jobId,
      customer: userId,
      professional: job.professional._id,
      rating,
      review,
      categories,
    });

    await newReview.save();

    // Update job with rating and review
    job.rating = rating;
    job.review = review;
    await job.save();

    // Update professional's average rating
    const professionalReviews = await Review.find({ professional: job.professional._id });
    const avgRating = professionalReviews.reduce((sum, r) => sum + r.rating, 0) / professionalReviews.length;
    
    await Professional.findByIdAndUpdate(job.professional._id, {
      'rating.average': avgRating,
      'rating.count': professionalReviews.length,
    });

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: { review: newReview },
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
});

// Get reviews for a professional
router.get('/professional/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ professional: professionalId })
      .populate('customer', 'firstName lastName profileImage')
      .populate('job', 'category completedAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ professional: professionalId });

    res.json({
      success: true,
      data: {
        reviews,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

// Get reviews given by a customer
router.get('/customer/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ customer: userId })
      .populate('professional', 'firstName lastName profileImage services rating')
      .populate('job', 'category completedAt title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ customer: userId });

    res.json({
      success: true,
      data: {
        reviews,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
});

// Professional responds to a review
router.post('/:reviewId/respond', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { responseText } = req.body;
    const professionalId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.professional.toString() !== professionalId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review',
      });
    }

    review.response = {
      text: responseText,
      respondedAt: new Date(),
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { review },
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to review',
      error: error.message,
    });
  }
});

export default router;
