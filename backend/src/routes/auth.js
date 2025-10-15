import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Professional from '../models/Professional.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const signupValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const professionalSignupValidation = [
  ...signupValidation,
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be selected'),
  body('services.*')
    .isIn(['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Appliance Repair', 'HVAC', 'Landscaping', 'Handyman', 'Other'])
    .withMessage('Invalid service selected'),
  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isPostalCode('IN')
    .withMessage('Please provide a valid pincode'),
];

// @route   POST /api/auth/signup/user
// @desc    Register a new user
// @access  Public
router.post('/signup/user', signupValidation, validateRequest, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrPhone(email) ||
                         await User.findByEmailOrPhone(phone) ||
                         await Professional.findByEmailOrPhone(email) ||
                         await Professional.findByEmailOrPhone(phone);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists',
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType: 'user',
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, 'user');

    // Return user data without password
    const userData = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token,
      },
    });

  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user account',
    });
  }
});

// @route   POST /api/auth/signup/professional
// @desc    Register a new professional
// @access  Public
router.post('/signup/professional', professionalSignupValidation, validateRequest, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, services, experience, city, zipCode, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrPhone(email) ||
                         await User.findByEmailOrPhone(phone) ||
                         await Professional.findByEmailOrPhone(email) ||
                         await Professional.findByEmailOrPhone(phone);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists',
      });
    }

    // Create new professional
    const professional = new Professional({
      firstName,
      lastName,
      email,
      phone,
      password,
      services,
      experience,
      city,
      zipCode,
      bio,
      userType: 'professional',
    });

    await professional.save();

    // Generate token
    const token = generateToken(professional._id, 'professional');

    // Return professional data without password
    const professionalData = professional.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Professional account created successfully',
      data: {
        professional: professionalData,
        token,
      },
    });

  } catch (error) {
    console.error('Professional signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating professional account',
    });
  }
});

// @route   POST /api/auth/login/user
// @desc    Login user
// @access  Public
router.post('/login/user', loginValidation, validateRequest, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }


	    // Guard against invalid GeoJSON leftover (e.g., type set without coordinates)
	    if (user.locationPoint && (!Array.isArray(user.locationPoint.coordinates) || user.locationPoint.coordinates.length !== 2)) {
	      user.locationPoint = undefined;
	    }

    // Update last login (harden against invalid GeoJSON on indexed field)
    const update = { $set: { lastLogin: new Date() } };
    if (user.locationPoint && (!Array.isArray(user.locationPoint?.coordinates) || user.locationPoint?.coordinates?.length !== 2)) {
      update.$unset = { locationPoint: "" };
    }
    await User.updateOne({ _id: user._id }, update);
    user.lastLogin = update.$set.lastLogin;
    if (update.$unset) user.locationPoint = undefined;

    // Generate token
    const token = generateToken(user._id, 'user');

    // Return user data without password
    const userData = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
    });
  }
});

// @route   POST /api/auth/login/professional
// @desc    Login professional
// @access  Public
router.post('/login/professional', loginValidation, validateRequest, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find professional by email or phone
    const professional = await Professional.findByEmailOrPhone(identifier).select('+password');

    if (!professional) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!professional.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Check password
    const isPasswordValid = await professional.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    professional.lastLogin = new Date();
    await professional.save();

    // Generate token
    const token = generateToken(professional._id, 'professional');

    // Return professional data without password
    const professionalData = professional.getPublicProfile();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        professional: professionalData,
        token,
      },
    });

  } catch (error) {
    console.error('Professional login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const userData = req.user.getPublicProfile();

    res.json({
      success: true,
      data: {
        user: userData,
        userType: req.userType,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
