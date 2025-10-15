import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Professional from '../models/Professional.js';

// Load environment variables
dotenv.config();

const migrateReviews = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all completed jobs with ratings
    const jobsWithReviews = await Job.find({
      status: 'completed',
      rating: { $exists: true, $ne: null },
    }).populate('user professional');

    console.log(`\n📊 Found ${jobsWithReviews.length} jobs with reviews`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const job of jobsWithReviews) {
      try {
        // Check if review already exists
        const existingReview = await Review.findOne({ job: job._id });
        
        if (existingReview) {
          console.log(`⏭️  Skipping job ${job._id} - review already exists`);
          skippedCount++;
          continue;
        }

        // Validate required fields
        if (!job.user || !job.professional) {
          console.log(`⚠️  Skipping job ${job._id} - missing user or professional`);
          skippedCount++;
          continue;
        }

        // Create review from job data
        const review = new Review({
          job: job._id,
          customer: job.user._id || job.user,
          professional: job.professional._id || job.professional,
          rating: job.rating,
          review: job.review || undefined,
          categories: {
            quality: job.rating,
            punctuality: job.rating,
            professionalism: job.rating,
            communication: job.rating,
          },
          isVerified: true,
          createdAt: job.completedAt || job.updatedAt,
          updatedAt: job.completedAt || job.updatedAt,
        });

        await review.save();
        console.log(`✅ Migrated review for job ${job._id}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating job ${job._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Migrated: ${migratedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${jobsWithReviews.length}`);

    // Update professional ratings
    console.log('\n🔄 Updating professional ratings...');
    const professionals = await Professional.find();
    
    for (const professional of professionals) {
      const reviews = await Review.find({ professional: professional._id });
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        professional.rating = {
          average: Math.round(avgRating * 10) / 10,
          count: reviews.length,
        };
        
        await professional.save();
        console.log(`✅ Updated ${professional.firstName} ${professional.lastName}: ${avgRating.toFixed(1)} (${reviews.length} reviews)`);
      }
    }

    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

migrateReviews();
