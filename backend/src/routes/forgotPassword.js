import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Professional from '../models/Professional.js';
import { validateRequest } from '../middleware/validation.js';
import crypto from 'crypto';

const router = express.Router();

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// OTP expiry time (5 minutes)
const OTP_EXPIRY = 5 * 60 * 1000;

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email validation
const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

// OTP verification validation
const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// @route   POST /api/forgot-password/send-otp
// @desc    Send OTP to user's email
// @access  Public
router.post('/send-otp', emailValidation, validateRequest, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists in either User or Professional collection
    let user = await User.findOne({ email });
    let userType = 'user';

    if (!user) {
      user = await Professional.findOne({ email });
      userType = 'professional';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email does not exist in our records',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    // Store OTP with email as key
    otpStore.set(email, {
      otp,
      expiresAt,
      userType,
      attempts: 0,
    });

    // In a real application, send email here using nodemailer
    // For now, we'll log it (in production, remove this and send actual email)
    console.log(`OTP for ${email}: ${otp}`);

    // Simulate email sending
    // TODO: Implement actual email sending with nodemailer
    // Example:
    // await sendEmail({
    //   to: email,
    //   subject: 'Password Reset OTP - FixItNow',
    //   text: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`,
    // });

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      // In production, remove the otp from response
      // This is only for development/testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
    });
  }
});

// @route   POST /api/forgot-password/verify-otp
// @desc    Verify OTP and reset password
// @access  Public
router.post('/verify-otp', otpValidation, validateRequest, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if OTP exists for this email
    const otpData = otpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.',
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      otpStore.set(email, otpData);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
      });
    }

    // OTP is valid, update password
    const Model = otpData.userType === 'user' ? User : Professional;
    const user = await Model.findOne({ email });

    if (!user) {
      otpStore.delete(email);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Clear OTP from store
    otpStore.delete(email);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP and resetting password',
    });
  }
});

// @route   POST /api/forgot-password/resend-otp
// @desc    Resend OTP to user's email
// @access  Public
router.post('/resend-otp', emailValidation, validateRequest, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    let userType = 'user';

    if (!user) {
      user = await Professional.findOne({ email });
      userType = 'professional';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email does not exist in our records',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    // Store new OTP
    otpStore.set(email, {
      otp,
      expiresAt,
      userType,
      attempts: 0,
    });

    console.log(`Resent OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP resent successfully to your email',
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
    });
  }
});

export default router;
