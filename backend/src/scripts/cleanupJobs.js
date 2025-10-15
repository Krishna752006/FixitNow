import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';

// Load environment variables
dotenv.config();

const cleanupJobs = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count jobs before deletion
    const totalJobs = await Job.countDocuments();
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const inProgressJobs = await Job.countDocuments({ status: 'in_progress' });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });

    console.log('\n📊 Current Job Statistics:');
    console.log(`   Total Jobs: ${totalJobs}`);
    console.log(`   Completed: ${completedJobs}`);
    console.log(`   In Progress: ${inProgressJobs}`);
    console.log(`   Pending: ${pendingJobs}`);

    // Delete all jobs
    console.log('\n🗑️  Deleting all jobs...');
    const deleteResult = await Job.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} jobs`);

    // Delete related notifications
    console.log('\n🗑️  Deleting job-related notifications...');
    const notificationResult = await Notification.deleteMany({ relatedJob: { $exists: true } });
    console.log(`✅ Deleted ${notificationResult.deletedCount} notifications`);

    console.log('\n✨ Cleanup completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupJobs();
