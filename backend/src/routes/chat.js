import express from 'express';
import { body } from 'express-validator';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/chat/jobs/:jobId/messages
// @desc    Get messages for a specific job
// @access  Private (User or assigned Professional only)
router.get('/jobs/:jobId/messages', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find the job and verify access
    const job = await Job.findById(jobId)
      .populate('user', 'firstName lastName')
      .populate('professional', 'firstName lastName')
      .populate({
        path: 'messages.sender',
        select: 'firstName lastName'
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user has access to this chat
    const hasAccess = (
      (userType === 'user' && job.user._id.toString() === userId.toString()) ||
      (userType === 'professional' && job.professional && job.professional._id.toString() === userId.toString())
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat',
      });
    }

    res.json({
      success: true,
      data: {
        job: {
          _id: job._id,
          title: job.title,
          status: job.status,
          user: job.user,
          professional: job.professional,
        },
        messages: job.messages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
    });
  }
});

// @route   POST /api/chat/jobs/:jobId/messages
// @desc    Send a message in job chat
// @access  Private (User or assigned Professional only)
router.post('/jobs/:jobId/messages', [
  authenticate,
  body('message').trim().isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  validateRequest,
], async (req, res) => {
  try {
    const { jobId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find the job and verify access
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if user has access to send messages
    const hasAccess = (
      (userType === 'user' && job.user.toString() === userId.toString()) ||
      (userType === 'professional' && job.professional && job.professional.toString() === userId.toString())
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat',
      });
    }

    // Add message to job
    const newMessage = {
      sender: userId,
      senderModel: userType === 'user' ? 'User' : 'Professional',
      message: message,
      timestamp: new Date(),
    };

    job.messages.push(newMessage);
    await job.save();

    // Populate the new message
    await job.populate({
      path: 'messages.sender',
      select: 'firstName lastName'
    });

    const savedMessage = job.messages[job.messages.length - 1];

    // Send notification to the other party
    const recipientId = userType === 'user' ? job.professional : job.user;
    const recipientModel = userType === 'user' ? 'Professional' : 'User';

    if (recipientId) {
      await Notification.createNotification({
        recipient: recipientId,
        recipientModel: recipientModel,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message about "${job.title}"`,
        relatedJob: job._id,
        relatedUser: userId,
        relatedUserModel: userType === 'user' ? 'User' : 'Professional',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: savedMessage },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
    });
  }
});

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;

    let filter;
    if (userType === 'user') {
      filter = { user: userId, professional: { $exists: true } };
    } else {
      filter = { professional: userId };
    }

    const jobs = await Job.find(filter)
      .populate('user', 'firstName lastName profileImage')
      .populate('professional', 'firstName lastName profileImage')
      .select('_id title status messages createdAt')
      .sort({ updatedAt: -1 });

    // Get conversations with last message info
    const conversations = jobs.map(job => {
      const lastMessage = job.messages.length > 0 
        ? job.messages[job.messages.length - 1] 
        : null;

      const otherParty = userType === 'user' ? job.professional : job.user;

      return {
        _id: job._id,
        title: job.title,
        status: job.status,
        otherParty: otherParty,
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          timestamp: lastMessage.timestamp,
          isFromMe: lastMessage.sender.toString() === userId.toString(),
        } : null,
        unreadCount: job.messages.filter(msg => 
          msg.sender.toString() !== userId.toString() && 
          msg.timestamp > (job.lastReadAt || new Date(0))
        ).length,
        updatedAt: job.updatedAt,
      };
    });

    res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
    });
  }
});

// @route   PUT /api/chat/jobs/:jobId/read
// @desc    Mark messages as read for a job
// @access  Private
router.put('/jobs/:jobId/read', authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    const userType = req.user.userType;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check access
    const hasAccess = (
      (userType === 'user' && job.user.toString() === userId.toString()) ||
      (userType === 'professional' && job.professional && job.professional.toString() === userId.toString())
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update lastReadAt timestamp for this user
    const fieldName = userType === 'user' ? 'userLastReadAt' : 'professionalLastReadAt';
    job[fieldName] = new Date();
    await job.save();

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
    });
  }
});

export default router;
