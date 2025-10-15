import express from 'express';
import Professional from '../models/Professional.js';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/professionals
// @desc    Get all professionals with filtering and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const {
      city,
      service,
      search,
      minRating,
      maxPrice,
      sortBy = 'rating',
      isActive = true
    } = req.query;

    // Build filter
    const filter = { 
      verificationStatus: 'verified',
      isActive: isActive === 'true'
    };

    if (city) {
      filter.city = new RegExp(city, 'i');
    }

    if (service) {
      filter.services = { $in: [service] };
    }

    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { services: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (minRating) {
      filter['rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      filter.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'price_low':
        sort = { hourlyRate: 1 };
        break;
      case 'price_high':
        sort = { hourlyRate: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'experience':
        sort = { experience: -1 };
        break;
      default:
        sort = { 'rating.average': -1 };
    }

    const professionals = await Professional.find(filter)
      .select('-password -email -phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalProfessionals = await Professional.countDocuments(filter);

    // Get additional stats for each professional
    const professionalIds = professionals.map(p => p._id);
    const jobStats = await Job.aggregate([
      { $match: { professional: { $in: professionalIds }, status: 'completed' } },
      {
        $group: {
          _id: '$professional',
          completedJobs: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalEarnings: { $sum: '$finalPrice' }
        }
      }
    ]);

    // Merge stats with professionals
    const professionalStatsMap = {};
    jobStats.forEach(stat => {
      professionalStatsMap[stat._id] = stat;
    });

    const enrichedProfessionals = professionals.map(professional => {
      const stats = professionalStatsMap[professional._id] || {
        completedJobs: 0,
        averageRating: 0,
        totalEarnings: 0
      };

      return {
        ...professional.toObject(),
        stats
      };
    });

    res.json({
      success: true,
      data: {
        professionals: enrichedProfessionals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProfessionals / limit),
          totalProfessionals,
          hasNext: page < Math.ceil(totalProfessionals / limit),
          hasPrev: page > 1
        },
        filters: {
          city,
          service,
          search,
          minRating,
          maxPrice,
          sortBy
        }
      },
    });
  } catch (error) {
    console.error('Get professionals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching professionals',
    });
  }
});

// @route   GET /api/professionals/:id
// @desc    Get single professional profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Allow viewing any professional profile (not just verified)
    // This is needed for users to view their assigned professional
    const professional = await Professional.findById(req.params.id).select('-password');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    // Get professional's job statistics
    const [completedJobs, jobStats] = await Promise.all([
      Job.countDocuments({ professional: professional._id, status: 'completed' }),
      Job.aggregate([
        { $match: { professional: professional._id, status: 'completed', rating: { $exists: true } } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 },
            totalEarnings: { $sum: '$finalPrice' }
          }
        }
      ])
    ]);

    // Get recent reviews
    const recentReviews = await Job.find({
      professional: professional._id,
      status: 'completed',
      rating: { $exists: true },
      review: { $exists: true, $ne: '' }
    })
      .populate('user', 'firstName lastName')
      .select('rating review completedAt user')
      .sort({ completedAt: -1 })
      .limit(5);

    const stats = jobStats.length > 0 ? jobStats[0] : {
      avgRating: 0,
      totalRatings: 0,
      totalEarnings: 0
    };

    res.json({
      success: true,
      data: {
        professional: {
          ...professional.toObject(),
          stats: {
            completedJobs,
            averageRating: stats.avgRating || 0,
            totalRatings: stats.totalRatings || 0,
            totalEarnings: stats.totalEarnings || 0
          },
          recentReviews
        }
      },
    });
  } catch (error) {
    console.error('Get professional profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching professional profile',
    });
  }
});

// @route   GET /api/professionals/services/categories
// @desc    Get all service categories with professional counts
// @access  Public
router.get('/services/categories', async (req, res) => {
  try {
    const { city } = req.query;
    
    // Build match filter based on parameters
    const matchFilter = { verificationStatus: 'verified', isActive: true };
    if (city) {
      matchFilter.city = { $regex: new RegExp(city, 'i') };
    }
    
    const categories = await Professional.aggregate([
      { $match: matchFilter },
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' },
          avgHourlyRate: { $avg: '$hourlyRate' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service categories',
    });
  }
});

// @route   GET /api/professionals/cities
// @desc    Get all cities where professionals are available
// @access  Public
router.get('/locations/cities', async (req, res) => {
  try {
    const cities = await Professional.aggregate([
      { $match: { verificationStatus: 'verified', isActive: true } },
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { cities },
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities',
    });
  }
});

// @route   POST /api/professionals/:id/contact
// @desc    Send contact message to professional (requires auth)
// @access  Private
router.post('/:id/contact', authenticate, async (req, res) => {
  try {
    const { message, jobTitle, category } = req.body;
    const professionalId = req.params.id;
    const userId = req.user._id;

    if (req.user.userType !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can contact professionals',
      });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    // Create a notification for the professional
    await Notification.createNotification({
      recipient: professionalId,
      recipientModel: 'Professional',
      type: 'contact_request',
      title: 'New Contact Request',
      message: `${req.user.firstName} ${req.user.lastName} sent you a message: "${message.substring(0, 50)}..."`,
      relatedUser: userId,
      relatedUserModel: 'User',
      metadata: {
        jobTitle,
        category,
        originalMessage: message
      }
    });

    res.json({
      success: true,
      message: 'Message sent to professional successfully',
    });
  } catch (error) {
    console.error('Contact professional error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message to professional',
    });
  }
});

export default router;
