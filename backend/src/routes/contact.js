import express from 'express';
import { sendContactEmail } from '../services/emailService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/contact/send-message
// Send a support message that will be emailed to service.fixitnow@gmail.com
router.post('/send-message', authenticate, async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
    const user = req.user;

    // Validate required fields
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Prepare contact data
    const contactData = {
      subject: subject.trim(),
      message: message.trim(),
      email: user.email,
      priority: priority || 'normal',
      userType: user.userType || 'user',
      userName: `${user.firstName} ${user.lastName}`,
    };

    // Send email
    const emailResult = await sendContactEmail(contactData);

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. Our support team will get back to you within 24 hours.',
      data: {
        messageId: emailResult.messageId,
      },
    });
  } catch (error) {
    console.error('Error in contact route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message,
    });
  }
});

// POST /api/contact/send-message-guest
// Send a support message without authentication (for guests)
router.post('/send-message-guest', async (req, res) => {
  try {
    const { subject, message, email, priority } = req.body;

    // Validate required fields
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Prepare contact data
    const contactData = {
      subject: subject.trim(),
      message: message.trim(),
      email: email.trim(),
      priority: priority || 'normal',
      userType: 'guest',
      userName: 'Guest User',
    };

    // Send email
    const emailResult = await sendContactEmail(contactData);

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. Our support team will get back to you within 24 hours.',
      data: {
        messageId: emailResult.messageId,
      },
    });
  } catch (error) {
    console.error('Error in guest contact route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message,
    });
  }
});

export default router;
