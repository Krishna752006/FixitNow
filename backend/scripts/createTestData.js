import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.development') });

import User from '../src/models/User.js';
import Job from '../src/models/Job.js';

const createTestData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected\n');

    // Create test customer
    console.log('📝 Creating test customer...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('User@123456', salt);

    const customer = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@test.com',
      phone: '+919876543210',
      password: hashedPassword,
      userType: 'user',
      isAdmin: false,
      isVerified: true,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
    });
    await customer.save();
    console.log('✅ Customer created: customer@test.com');

    // Create test professional
    console.log('📝 Creating test professional...');
    const professional = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'professional@test.com',
      phone: '+919876543211',
      password: hashedPassword,
      userType: 'professional',
      isAdmin: false,
      isVerified: true,
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
    });
    await professional.save();
    console.log('✅ Professional created: professional@test.com');

    // Create test jobs
    console.log('📝 Creating test jobs...');
    
    const jobs = [
      {
        title: 'Plumbing Repair',
        description: 'Fix leaking kitchen sink',
        category: 'Plumbing',
        priority: 'high',
        status: 'completed',
        userId: customer._id,
        professionalId: professional._id,
        location: {
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        scheduledDate: new Date('2025-10-20'),
        scheduledTime: '10:00 AM',
        estimatedDuration: 2,
        finalPrice: 500,
        completedAt: new Date(),
      },
      {
        title: 'Electrical Work',
        description: 'Install new light fixtures',
        category: 'Electrical',
        priority: 'medium',
        status: 'in_progress',
        userId: customer._id,
        professionalId: professional._id,
        location: {
          address: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
        },
        scheduledDate: new Date('2025-10-25'),
        scheduledTime: '2:00 PM',
        estimatedDuration: 3,
        finalPrice: 750,
      },
      {
        title: 'Carpentry',
        description: 'Build custom shelves',
        category: 'Carpentry',
        priority: 'low',
        status: 'pending',
        userId: customer._id,
        professionalId: null,
        location: {
          address: '789 Pine Road',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
        },
        scheduledDate: new Date('2025-11-01'),
        scheduledTime: '9:00 AM',
        estimatedDuration: 4,
        finalPrice: 1000,
      },
    ];

    for (const jobData of jobs) {
      const job = new Job(jobData);
      await job.save();
    }
    console.log(`✅ ${jobs.length} test jobs created`);

    console.log('\n📋 Test Data Created:');
    console.log('   Customer: customer@test.com / User@123456');
    console.log('   Professional: professional@test.com / User@123456');
    console.log('   Jobs: 3 test jobs (1 completed, 1 in progress, 1 pending)');
    console.log('\n💰 Financial Summary:');
    console.log('   Completed Jobs: 2 (Plumbing + Electrical)');
    console.log('   Total Revenue: ₹1,250');
    console.log('   Platform Commission (15%): ₹187.50');
    console.log('   Professional Payouts (85%): ₹1,062.50');

    await mongoose.connection.close();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestData();
