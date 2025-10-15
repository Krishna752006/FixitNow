import express from 'express';
import FavoriteProfessional from '../models/FavoriteProfessional.js';
import Professional from '../models/Professional.js';
import Job from '../models/Job.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add a professional to favorites
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { professionalId, notes } = req.body;
    const userId = req.user._id;

    // Check if professional exists
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    // Check if already favorited
    const existing = await FavoriteProfessional.findOne({
      user: userId,
      professional: professionalId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Professional already in favorites',
      });
    }

    // Get last service date and total services
    const jobs = await Job.find({
      user: userId,
      professional: professionalId,
      status: 'completed',
    }).sort({ completedAt: -1 });

    const favorite = new FavoriteProfessional({
      user: userId,
      professional: professionalId,
      lastServiceDate: jobs.length > 0 ? jobs[0].completedAt : null,
      totalServicesCompleted: jobs.length,
      notes,
    });

    await favorite.save();

    res.json({
      success: true,
      message: 'Professional added to favorites',
      data: { favorite },
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite',
      error: error.message,
    });
  }
});

// Remove a professional from favorites
router.delete('/remove/:professionalId', authenticateToken, async (req, res) => {
  try {
    const { professionalId } = req.params;
    const userId = req.user._id;

    const result = await FavoriteProfessional.findOneAndDelete({
      user: userId,
      professional: professionalId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    res.json({
      success: true,
      message: 'Professional removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
      error: error.message,
    });
  }
});

// Get user's favorite professionals
router.get('/my-favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await FavoriteProfessional.find({ user: userId })
      .populate({
        path: 'professional',
        select: 'firstName lastName profileImage services rating city bio',
      })
      .sort({ lastServiceDate: -1 });

    res.json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error.message,
    });
  }
});

// Check if a professional is favorited
router.get('/check/:professionalId', authenticateToken, async (req, res) => {
  try {
    const { professionalId } = req.params;
    const userId = req.user._id;

    const favorite = await FavoriteProfessional.findOne({
      user: userId,
      professional: professionalId,
    });

    res.json({
      success: true,
      data: { isFavorite: !!favorite },
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status',
      error: error.message,
    });
  }
});

// Get user's previous professionals (not necessarily favorited)
router.get('/previous-professionals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all completed jobs with professionals
    const jobs = await Job.find({
      user: userId,
      status: 'completed',
      professional: { $exists: true, $ne: null },
    })
      .populate('professional', 'firstName lastName profileImage services rating city')
      .sort({ completedAt: -1 });

    // Group by professional
    const professionalsMap = new Map();
    
    jobs.forEach(job => {
      if (!job.professional) return;
      
      const profId = job.professional._id.toString();
      if (!professionalsMap.has(profId)) {
        professionalsMap.set(profId, {
          professional: job.professional,
          lastServiceDate: job.completedAt,
          totalServicesCompleted: 1,
          lastRating: job.rating,
        });
      } else {
        const existing = professionalsMap.get(profId);
        existing.totalServicesCompleted += 1;
        if (job.completedAt > existing.lastServiceDate) {
          existing.lastServiceDate = job.completedAt;
          existing.lastRating = job.rating;
        }
      }
    });

    const previousProfessionals = Array.from(professionalsMap.values());

    res.json({
      success: true,
      data: { previousProfessionals },
    });
  } catch (error) {
    console.error('Error fetching previous professionals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch previous professionals',
      error: error.message,
    });
  }
});

export default router;
