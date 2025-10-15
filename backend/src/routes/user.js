import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

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
    cb(null, `user-${req.user._id}-${uniqueSuffix}${ext}`);
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

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private (User only)
router.get('/profile', authenticate, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private (User only)
router.put('/profile', [
  authenticate,
  authorize('user'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim().custom((value) => {
    if (!value || value === '') return true; // Allow empty string
    const validStates = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];
    return validStates.includes(value);
  }).withMessage('State must be a valid Indian state'),
  body('address.zipCode').optional().trim().custom((value) => {
    if (!value || value === '') return true; // Allow empty string
    return /^[1-9][0-9]{5}$/.test(value); // Indian pincode format
  }).withMessage('Please provide a valid Indian pincode'),
  body('address.country').optional().trim(),
  validateRequest,
], async (req, res) => {
  try {
    const { firstName, lastName, phone, address, location } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Optional: allow users to set a geospatial point for their location
    if (location?.coordinates?.lat && location?.coordinates?.lng) {
      const { lat, lng } = location.coordinates;
      updateData.locationPoint = { type: 'Point', coordinates: [lng, lat] };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true, strict: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
});

// @route   GET /api/user/dashboard-stats
// @desc    Get user dashboard statistics
// @access  Private (User only)
router.get('/dashboard-stats', authenticate, authorize('user'), async (req, res) => {
  try {
    const userId = req.user._id;

    // Get job statistics
    const [
      activeJobs,
      upcomingJobs,
      completedJobs,
      totalJobs,
      unreadNotifications
    ] = await Promise.all([
      Job.countDocuments({ user: userId, status: { $in: ['accepted', 'in_progress'] } }),
      Job.countDocuments({ 
        user: userId, 
        status: 'accepted',
        scheduledDate: { $gte: new Date() }
      }),
      Job.countDocuments({ user: userId, status: 'completed' }),
      Job.countDocuments({ user: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    // Calculate total spent
    const completedJobsWithPrice = await Job.find({ 
      user: userId, 
      status: 'completed',
      finalPrice: { $exists: true }
    }).select('finalPrice');
    
    const totalSpent = completedJobsWithPrice.reduce((sum, job) => sum + (job.finalPrice || 0), 0);

    // Get average rating
    const ratedJobs = await Job.find({ 
      user: userId, 
      status: 'completed',
      rating: { $exists: true }
    }).select('rating');
    
    const averageRating = ratedJobs.length > 0 
      ? ratedJobs.reduce((sum, job) => sum + job.rating, 0) / ratedJobs.length 
      : 0;

    const stats = {
      activeJobs,
      upcomingJobs,
      completedJobs,
      totalJobs,
      totalSpent,
      averageRating: Math.round(averageRating * 10) / 10,
      unreadNotifications,
      memberSince: req.user.createdAt,
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
    });
  }
});

// @route   GET /api/user/notifications
// @desc    Get user notifications
// @access  Private (User only)
router.get('/notifications', authenticate, authorize('user'), async (req, res) => {
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
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

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
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
    });
  }
});

// @route   PUT /api/user/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (User only)
router.put('/notifications/:id/read', authenticate, authorize('user'), async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
    });
  }
});

// @route   PUT /api/user/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private (User only)
router.put('/notifications/mark-all-read', authenticate, authorize('user'), async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
    });
  }
});

// @route   POST /api/user/profile/image
// @desc    Upload user profile image
// @access  Private (User only)
router.post('/profile/image', authenticate, authorize('user'), upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    // Delete old profile image if it exists
    const user = await User.findById(req.user._id);
    if (user.profileImage) {
      const oldImagePath = path.join(process.cwd(), 'uploads', 'profiles', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user profile with new image URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: imageUrl,
        user: updatedUser,
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

// @route   GET /api/user/addresses
// @desc    Get user's saved addresses
// @access  Private (User only)
router.get('/addresses', authenticate, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { addresses: user.addresses || [] },
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses',
    });
  }
});

// @route   PUT /api/user/preferences/auto-assign
// @desc    Toggle auto-assignment preference
// @access  Private (User only)
router.put('/preferences/auto-assign', authenticate, authorize('user'), async (req, res) => {
  try {
    const { autoAssignProfessional } = req.body;

    if (typeof autoAssignProfessional !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoAssignProfessional must be a boolean value',
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update preference
    if (!user.preferences) {
      user.preferences = { notifications: { email: true, sms: false, push: true } };
    }
    user.preferences.autoAssignProfessional = autoAssignProfessional;
    
    await user.save();

    res.json({
      success: true,
      message: `Auto-assignment ${autoAssignProfessional ? 'enabled' : 'disabled'}`,
      data: { autoAssignProfessional },
    });
  } catch (error) {
    console.error('Update auto-assign preference error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preference',
    });
  }
});

// @route   GET /api/user/addresses
// @desc    Get user's saved addresses
// @access  Private (User only)
router.get('/addresses', authenticate, authorize('user'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        addresses: user.addresses || [],
      },
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses',
    });
  }
});

// @route   POST /api/user/addresses
// @desc    Add a new address
// @access  Private (User only)
router.post('/addresses', authenticate, authorize('user'), async (req, res) => {
  try {
    const { label, address, city, state, zipCode, coordinates, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    // If this is the first address or marked as default, set all others to non-default
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Add new address
    const newAddress = {
      label: label || 'Home',
      address,
      city,
      state,
      zipCode,
      coordinates,
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      data: {
        address: user.addresses[user.addresses.length - 1],
      },
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding address',
    });
  }
});

// @route   PUT /api/user/addresses/:addressId
// @desc    Update an address
// @access  Private (User only)
router.put('/addresses/:addressId', authenticate, authorize('user'), async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, address, city, state, zipCode, coordinates, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // If setting as default, unset all others
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      label: label || user.addresses[addressIndex].label,
      address: address || user.addresses[addressIndex].address,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      zipCode: zipCode || user.addresses[addressIndex].zipCode,
      coordinates: coordinates || user.addresses[addressIndex].coordinates,
      isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: user.addresses[addressIndex],
      },
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
    });
  }
});

// @route   DELETE /api/user/addresses/:addressId
// @desc    Delete an address
// @access  Private (User only)
router.delete('/addresses/:addressId', authenticate, authorize('user'), async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are other addresses, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address',
    });
  }
});

// @route   PUT /api/user/addresses/:addressId/set-default
// @desc    Set an address as default
// @access  Private (User only)
router.put('/addresses/:addressId/set-default', authenticate, authorize('user'), async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Set all addresses to non-default
    user.addresses.forEach(addr => addr.isDefault = false);
    
    // Set selected address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default address',
    });
  }
});

export default router;
