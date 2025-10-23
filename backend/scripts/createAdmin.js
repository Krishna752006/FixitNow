import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.development') });

// Import User model
import User from '../src/models/User.js';

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fixitnow.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating...');
      
      // Update the admin user - let Mongoose pre-save hook hash the password
      existingAdmin.firstName = 'Admin';
      existingAdmin.lastName = 'User';
      existingAdmin.password = 'Admin@123456'; // Will be hashed by pre-save hook
      existingAdmin.isAdmin = true;
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      existingAdmin.isPhoneVerified = true;
      existingAdmin.userType = 'user';
      
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('📝 Creating new admin user...');

      // Create new admin user - let Mongoose pre-save hook hash the password
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@fixitnow.com',
        phone: '+919876543210',
        password: 'Admin@123456', // Will be hashed by pre-save hook
        userType: 'user',
        isAdmin: true,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@fixitnow.com');
    console.log('   Password: Admin@123456');
    console.log('   Access: http://localhost:5173/admin (after login)');

    await mongoose.connection.close();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
