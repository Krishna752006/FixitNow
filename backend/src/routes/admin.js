import express from 'express';
import { body } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import dynamicConfig from '../config/dynamicConfig.js';
import * as adminController from '../controllers/adminController.js';
import * as servicePricingController from '../controllers/servicePricingController.js';

const router = express.Router();

// PHASE 1: DASHBOARD
router.get('/dashboard/stats', authenticate, requireAdmin, adminController.getDashboardStats);

// PHASE 1: USER MANAGEMENT
router.get('/users', authenticate, requireAdmin, adminController.getAllUsers);
router.get('/users/:id', authenticate, requireAdmin, adminController.getUserById);
router.patch('/users/:id/verify', authenticate, requireAdmin, adminController.updateUserVerification);
router.patch('/users/:id/suspend', authenticate, requireAdmin, adminController.suspendUser);
router.patch('/users/:id/reactivate', authenticate, requireAdmin, adminController.reactivateUser);

// PHASE 1: JOB MONITORING
router.get('/jobs', authenticate, requireAdmin, adminController.getAllJobs);
router.get('/jobs/:id', authenticate, requireAdmin, adminController.getJobById);
router.patch('/jobs/:id/reassign', authenticate, requireAdmin, adminController.reassignProfessional);

// PHASE 2: SERVICE CONFIGURATION
router.get('/services/categories', authenticate, requireAdmin, adminController.getServiceCategories);
router.post('/services/categories', authenticate, requireAdmin, adminController.addServiceCategory);

// PHASE 2: SERVICE PRICING MANAGEMENT
router.get('/services/pricing', authenticate, requireAdmin, servicePricingController.getAllServicePrices);
router.get('/services/pricing/:serviceName', authenticate, requireAdmin, servicePricingController.getServicePricesByCategory);
router.post('/services/update-price', authenticate, requireAdmin, servicePricingController.updateServicePrice);
router.post('/services/bulk-update-prices', authenticate, requireAdmin, servicePricingController.bulkUpdatePrices);
router.get('/services/price-history/:serviceName/:subServiceTitle', authenticate, requireAdmin, servicePricingController.getPriceHistory);

// PUBLIC: SERVICE PRICING (for user dashboard)
router.get('/services/pricing', servicePricingController.getAllServicePrices);

// PHASE 2: FINANCIAL MANAGEMENT
router.get('/financial/transactions', authenticate, requireAdmin, adminController.getTransactionHistory);
router.get('/financial/report', authenticate, requireAdmin, adminController.getFinancialReport);

// PHASE 3: ANALYTICS
router.get('/analytics/data', authenticate, requireAdmin, adminController.getAnalyticsData);

// PHASE 3: AUDIT LOG
router.get('/audit-log', authenticate, requireAdmin, adminController.getAuditLog);

// LEGACY: Razorpay configuration endpoints
router.post('/config/razorpay', [
  authenticate,
  requireAdmin,
  body('keyId').trim().notEmpty().withMessage('Razorpay Key ID is required'),
  body('keySecret').trim().notEmpty().withMessage('Razorpay Key Secret is required'),
  validateRequest,
], async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;

    if (!keyId.startsWith('rzp_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay Key ID format. Should start with "rzp_"'
      });
    }

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

router.get('/config/status', authenticate, requireAdmin, async (req, res) => {
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
router.delete('/config/razorpay', authenticate, requireAdmin, async (req, res) => {
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
