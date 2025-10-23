import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.development') });

import User from '../src/models/User.js';

const verifyAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected\n');

    const admin = await User.findOne({ email: 'admin@fixitnow.com' }).select('+password');
    
    if (!admin) {
      console.error('❌ Admin user not found in database');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   First Name:', admin.firstName);
    console.log('   Last Name:', admin.lastName);
    console.log('   isAdmin:', admin.isAdmin);
    console.log('   isVerified:', admin.isVerified);
    console.log('   isActive:', admin.isActive);
    console.log('   isEmailVerified:', admin.isEmailVerified);
    console.log('   Password hash exists:', !!admin.password);
    console.log('   Password hash length:', admin.password?.length);

    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isPasswordValid = await admin.comparePassword('Admin@123456');
    console.log('   Password "Admin@123456" matches:', isPasswordValid);

    if (!isPasswordValid) {
      console.error('   ❌ Password does NOT match!');
      console.log('   This is why login is failing.');
    } else {
      console.log('   ✅ Password matches correctly');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyAdmin();
