import express from 'express';
import { param, body } from 'express-validator';
import Job from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Update job status
router.patch('/:id/status', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid job ID'),
  body('status')
    .isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes').optional().isString().trim(),
  validateRequest
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check
    if (req.user.role === 'professional' && !job.professional?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    if (req.user.role === 'user' && !job.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Update status
    await job.updateStatus(
      req.body.status,
      req.user._id,
      req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      req.body.notes
    );

    // Create notification for the other party
    const recipient = req.user.role === 'user' ? job.professional : job.user;
    if (recipient) {
      await Notification.create({
        recipient,
        recipientModel: req.user.role === 'user' ? 'Professional' : 'User',
        type: 'job_status_update',
        title: 'Job Status Updated',
        message: `Job #${job._id} status changed to ${req.body.status}`,
        referenceId: job._id,
        referenceModel: 'Job'
      });
    }

    res.json({ 
      message: 'Job status updated successfully',
      status: job.status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get job status history
router.get('/:id/status-history', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid job ID'),
  validateRequest
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id, 'statusHistory');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check
    if (req.user.role === 'professional' && !job.professional?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this job' });
    }

    if (req.user.role === 'user' && !job.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this job' });
    }

    res.json({ statusHistory: job.statusHistory });
  } catch (error) {
    console.error('Error fetching status history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate invoice for completed job
router.post('/:id/generate-invoice', [
  authenticate,
  param('id').isMongoId().withMessage('Invalid job ID'),
  validateRequest
], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow users and admins to generate invoices
    if (req.user.role !== 'admin' && !job.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to generate invoice for this job' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Cannot generate invoice for incomplete job' });
    }

    const invoice = await job.generateInvoice();
    
    res.json({ 
      message: 'Invoice generated successfully',
      invoice
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

export default router;
