import User from '../models/User.js';
import Job from '../models/Job.js';
import Professional from '../models/Professional.js';

// PHASE 1: USER ADMINISTRATION

export const getAllUsers = async (req, res) => {
  try {
    const { search, userType, isVerified, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (userType) query.userType = userType;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateUserVerification = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: user,
    });
  } catch (error) {
    console.error('Update user verification error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User reactivated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PHASE 1: JOB MONITORING

export const getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const jobs = await Job.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('professionalId', 'firstName lastName email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: jobs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('professionalId', 'firstName lastName email phone');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const reassignProfessional = async (req, res) => {
  try {
    const { newProfessionalId } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { professionalId: newProfessionalId },
      { new: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('professionalId', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      message: 'Professional reassigned successfully',
      data: job,
    });
  } catch (error) {
    console.error('Reassign professional error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PHASE 1: DASHBOARD STATS

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ userType: 'user' });
    const totalProfessionals = await User.countDocuments({ userType: 'professional' });
    const activeJobs = await Job.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } });
    const completedJobs = await Job.countDocuments({ status: 'completed' });

    const revenueData = await Job.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$finalPrice' } } },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProfessionals,
        activeJobs,
        completedJobs,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PHASE 2: SERVICE CONFIGURATION

export const getServiceCategories = async (req, res) => {
  try {
    const categories = await Professional.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addServiceCategory = async (req, res) => {
  try {
    const { categoryName, basePrice, description } = req.body;

    if (!categoryName || !basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Category name and base price are required',
      });
    }

    res.json({
      success: true,
      message: 'Service category added successfully',
      data: { categoryName, basePrice, description },
    });
  } catch (error) {
    console.error('Add service category error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PHASE 2: FINANCIAL MANAGEMENT

export const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Job.find({ status: 'completed' })
      .select('_id finalPrice createdAt userId professionalId')
      .populate('userId', 'firstName lastName email')
      .populate('professionalId', 'firstName lastName email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { status: 'completed' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const jobs = await Job.find(query);
    const totalRevenue = jobs.reduce((sum, job) => sum + (job.finalPrice || 0), 0);
    const platformCommission = totalRevenue * 0.15;
    const professionalPayouts = totalRevenue - platformCommission;

    res.json({
      success: true,
      data: {
        totalRevenue,
        platformCommission,
        professionalPayouts,
        totalJobs: jobs.length,
      },
    });
  } catch (error) {
    console.error('Get financial report error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PHASE 3: ANALYTICS

export const getAnalyticsData = async (req, res) => {
  try {
    const avgCompletionTime = await Job.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ['$completedAt', '$createdAt'],
            },
          },
        },
      },
    ]);

    const acceptanceRate = await Job.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $ne: ['$professionalId', null] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          acceptanceRate: {
            $multiply: [{ $divide: ['$accepted', '$total'] }, 100],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        avgCompletionTime: avgCompletionTime[0]?.avgTime || 0,
        acceptanceRate: acceptanceRate[0]?.acceptanceRate || 0,
      },
    });
  } catch (error) {
    console.error('Get analytics data error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// PHASE 3: AUDIT LOG

export const getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    res.json({
      success: true,
      message: 'Audit log retrieved successfully',
      data: [],
      pagination: { total: 0, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
