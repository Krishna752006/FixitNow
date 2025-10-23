import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import {
  chatWithAI,
  findMatchingProfessionals,
  notifyProfessionalsOfJob,
  getFAQCategories,
  searchFAQByCategory,
} from '../services/chatbotService.js';

const router = express.Router();

// @route   POST /api/chatbot/chat
// @desc    Send message to AI chatbot
// @access  Private
router.post('/chat', [
  authenticate,
  body('message').trim().notEmpty().withMessage('Message is required'),
  validateRequest,
], async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const response = await chatWithAI(message, conversationHistory);

    if (!response.success) {
      return res.status(500).json({
        success: false,
        message: response.message,
      });
    }

    res.json({
      success: true,
      data: {
        message: response.message,
        source: response.source,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chat message',
    });
  }
});

// @route   POST /api/chatbot/match-professionals
// @desc    Find top 3 matching professionals for a job
// @access  Private
router.post('/match-professionals', [
  authenticate,
  body('category').notEmpty().withMessage('Category is required'),
  body('location').notEmpty().withMessage('Location is required'),
  validateRequest,
], async (req, res) => {
  try {
    const jobData = req.body;

    const result = await findMatchingProfessionals(jobData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        professionals: result.professionals,
        count: result.professionals.length,
      },
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding matching professionals',
    });
  }
});

// @route   POST /api/chatbot/notify-professionals
// @desc    Notify professionals of matching job
// @access  Private
router.post('/notify-professionals', [
  authenticate,
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('professionalIds').isArray().withMessage('Professional IDs must be an array'),
  validateRequest,
], async (req, res) => {
  try {
    const { jobId, professionalIds } = req.body;

    const result = await notifyProfessionalsOfJob(jobId, professionalIds);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        notified: result.notified,
        message: `Notified ${result.notified} professionals`,
      },
    });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error notifying professionals',
    });
  }
});

// @route   GET /api/chatbot/faq
// @desc    Get all FAQ categories
// @access  Public
router.get('/faq', (req, res) => {
  try {
    const categories = getFAQCategories();

    res.json({
      success: true,
      data: {
        categories,
        total: categories.length,
      },
    });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
    });
  }
});

// @route   GET /api/chatbot/faq/:category
// @desc    Get FAQ by category
// @access  Public
router.get('/faq/:category', [
  param('category').notEmpty().withMessage('Category is required'),
  validateRequest,
], (req, res) => {
  try {
    const { category } = req.params;
    const result = searchFAQByCategory(category);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        category,
        items: result.items,
        total: result.items.length,
      },
    });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ category',
    });
  }
});

export default router;
