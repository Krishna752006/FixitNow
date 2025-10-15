import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import dynamicConfig from '../config/dynamicConfig.js';

const router = express.Router();

// @route   POST /api/admin/config/razorpay
// @desc    Set Razorpay credentials dynamically
// @access  Private (Admin only - for now, we'll allow any authenticated user)
router.post('/config/razorpay', [
  authenticate,
  body('keyId').trim().notEmpty().withMessage('Razorpay Key ID is required'),
  body('keySecret').trim().notEmpty().withMessage('Razorpay Key Secret is required'),
  validateRequest,
], async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;

    // Validate key format (basic validation)
    if (!keyId.startsWith('rzp_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay Key ID format. Should start with "rzp_"'
      });
    }

    // Set the credentials
    const success = dynamicConfig.setRazorpayCredentials(keyId, keySecret);

    if (success) {
      res.json({
        success: true,
        message: 'Razorpay credentials configured successfully',
        data: {
          keyId: `${keyId.substring(0, 8)}...`,
          configured: true
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to configure Razorpay credentials'
      });
    }
  } catch (error) {
    console.error('Set Razorpay config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error configuring Razorpay credentials'
    });
  }
});

// @route   GET /api/admin/config/status
// @desc    Get configuration status
// @access  Private
router.get('/config/status', authenticate, async (req, res) => {
  try {
    const status = dynamicConfig.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get config status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting configuration status'
    });
  }
});

// @route   DELETE /api/admin/config/razorpay
// @desc    Reset Razorpay configuration
// @access  Private
router.delete('/config/razorpay', authenticate, async (req, res) => {
  try {
    dynamicConfig.reset();
    
    res.json({
      success: true,
      message: 'Razorpay configuration reset successfully'
    });
  } catch (error) {
    console.error('Reset Razorpay config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting Razorpay configuration'
    });
  }
});

export default router;
