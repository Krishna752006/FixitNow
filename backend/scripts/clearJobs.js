import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
import Job from '../src/models/Job.js';
import Notification from '../src/models/Notification.js';
import Professional from '../src/models/Professional.js';

const clearAllJobs = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Starting cleanup process...\n');

    // Delete all jobs
    const jobsDeleted = await Job.deleteMany({});
    console.log(`✅ Deleted ${jobsDeleted.deletedCount} jobs`);

    // Delete all notifications
    const notificationsDeleted = await Notification.deleteMany({});
    console.log(`✅ Deleted ${notificationsDeleted.deletedCount} notifications`);

    // Reset professional ratings and review counts
    const professionalsUpdated = await Professional.updateMany(
      {},
      {
        $set: {
          'rating.average': 0,
          'rating.count': 0
        }
      }
    );
    console.log(`✅ Reset ratings for ${professionalsUpdated.modifiedCount} professionals`);

    console.log('\n✨ Database cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Jobs deleted: ${jobsDeleted.deletedCount}`);
    console.log(`   - Notifications deleted: ${notificationsDeleted.deletedCount}`);
    console.log(`   - Professionals reset: ${professionalsUpdated.modifiedCount}`);
    console.log('\n🎉 All jobs and reviews have been cleared!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
clearAllJobs();
