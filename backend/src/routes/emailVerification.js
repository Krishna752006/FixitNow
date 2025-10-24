import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Professional from '../models/Professional.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { sendNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// In-memory OTP storage for email verification
const emailVerificationStore = new Map();

// OTP expiry time (10 minutes)
const OTP_EXPIRY = 10 * 60 * 1000;

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/email-verification/send-otp
// @desc    Send OTP to user's email for verification
// @access  Private
router.post('/send-otp', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const email = user.email;

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    // Store OTP
    emailVerificationStore.set(email, {
      otp,
      expiresAt,
      userId: user._id,
      attempts: 0,
    });

    // Send OTP via email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Email Verification OTP</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #666; margin-bottom: 15px;">Your One-Time Password (OTP) for email verification is:</p>
            <h1 style="color: #ea580c; font-size: 48px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">This OTP will expire in 10 minutes</p>
          </div>

          <div style="background-color: #fff3e0; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0;">
            <p style="color: #666; margin: 0;">
              <strong>Security Tip:</strong> Never share this OTP with anyone. FixItNow support will never ask for your OTP.
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request this OTP, please ignore this email or contact support immediately.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              © 2025 FixItNow. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await sendNotificationEmail(
        email,
        'Email Verification OTP - FixItNow',
        emailHtml
      );

      console.log(`✅ Email verification OTP sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Return error to user instead of silently failing
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email configuration or try again later.',
        error: emailError.message,
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
    });

  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
    });
  }
});

// @route   POST /api/email-verification/verify-otp
// @desc    Verify OTP and mark email as verified
// @access  Private
router.post('/verify-otp', [
  authenticate,
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  validateRequest,
], async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;
    const email = user.email;

    // Check if OTP exists for this email
    const otpData = emailVerificationStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.',
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      emailVerificationStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      emailVerificationStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.',
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      emailVerificationStore.set(email, otpData);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
      });
    }

    // OTP is valid, mark email as verified
    const Model = user.userType === 'professional' ? Professional : User;
    const updatedUser = await Model.findByIdAndUpdate(
      user._id,
      { isEmailVerified: true },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      emailVerificationStore.delete(email);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Clear OTP from store
    emailVerificationStore.delete(email);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      data: { user: updatedUser },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
    });
  }
});

// @route   POST /api/email-verification/resend-otp
// @desc    Resend OTP to user's email
// @access  Private
router.post('/resend-otp', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const email = user.email;

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY;

    // Store new OTP
    emailVerificationStore.set(email, {
      otp,
      expiresAt,
      userId: user._id,
      attempts: 0,
    });

    // Send OTP via email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Email Verification OTP (Resent)</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #666; margin-bottom: 15px;">Your One-Time Password (OTP) for email verification is:</p>
            <h1 style="color: #ea580c; font-size: 48px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">This OTP will expire in 10 minutes</p>
          </div>

          <div style="background-color: #fff3e0; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0;">
            <p style="color: #666; margin: 0;">
              <strong>Security Tip:</strong> Never share this OTP with anyone. FixItNow support will never ask for your OTP.
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request this OTP, please ignore this email or contact support immediately.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              © 2025 FixItNow. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await sendNotificationEmail(
        email,
        'Email Verification OTP (Resent) - FixItNow',
        emailHtml
      );

      console.log(`✅ Email verification OTP resent to ${email}`);
    } catch (emailError) {
      console.error('Error sending resent verification email:', emailError);
      // Return error to user instead of silently failing
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP email. Please check your email configuration or try again later.',
        error: emailError.message,
      });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully to your email',
    });

  } catch (error) {
    console.error('Resend verification OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
    });
  }
});

export default router;
