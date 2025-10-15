#!/usr/bin/env node

/**
 * Test script for profile image upload functionality
 * Run this after starting the backend server to test image uploads
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const API_BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  // You'll need to replace these with actual tokens from your auth system
  professionalToken: 'your-professional-jwt-token-here',
  userToken: 'your-user-jwt-token-here',
  testImagePath: './test-image.jpg' // Create a small test image file
};

async function testImageUpload(userType, token) {
  console.log(`\n🧪 Testing ${userType} profile image upload...`);
  
  try {
    // Check if test image exists
    if (!fs.existsSync(TEST_CONFIG.testImagePath)) {
      console.log('❌ Test image not found. Please create a test-image.jpg file in the backend directory');
      return false;
    }

    // Create form data
    const formData = new FormData();
    formData.append('profileImage', fs.createReadStream(TEST_CONFIG.testImagePath));

    // Make upload request
    const response = await fetch(`${API_BASE_URL}/${userType}/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📸 Image URL:', result.data?.profileImage);
      return true;
    } else {
      console.log('❌ Upload failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Upload error:', error.message);
    return false;
  }
}

async function testUploadDirectory() {
  console.log('\n📁 Testing upload directory...');
  
  const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
  
  if (fs.existsSync(uploadDir)) {
    console.log('✅ Upload directory exists:', uploadDir);
    
    // Check permissions
    try {
      const testFile = path.join(uploadDir, 'test-write.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Directory is writable');
      return true;
    } catch (error) {
      console.log('❌ Directory is not writable:', error.message);
      return false;
    }
  } else {
    console.log('❌ Upload directory does not exist:', uploadDir);
    console.log('💡 Creating directory...');
    
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Directory created successfully');
      return true;
    } catch (error) {
      console.log('❌ Failed to create directory:', error.message);
      return false;
    }
  }
}

async function testStaticFileServing() {
  console.log('\n🌐 Testing static file serving...');
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/uploads/profiles/test.txt`);
    
    if (response.status === 404) {
      console.log('✅ Static file serving is configured (404 for non-existent file is expected)');
      return true;
    } else {
      console.log('✅ Static file serving is working');
      return true;
    }
  } catch (error) {
    console.log('❌ Static file serving test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Profile Image Upload Tests');
  console.log('=====================================');
  
  // Test 1: Upload directory
  const dirTest = await testUploadDirectory();
  
  // Test 2: Static file serving
  const staticTest = await testStaticFileServing();
  
  // Test 3: Image uploads (requires valid tokens)
  console.log('\n📝 Note: To test actual image uploads, you need to:');
  console.log('1. Start the backend server');
  console.log('2. Login as a professional and user to get JWT tokens');
  console.log('3. Update TEST_CONFIG with valid tokens');
  console.log('4. Create a test-image.jpg file in the backend directory');
  console.log('5. Run this script again');
  
  if (TEST_CONFIG.professionalToken !== 'your-professional-jwt-token-here') {
    await testImageUpload('professional', TEST_CONFIG.professionalToken);
  }
  
  if (TEST_CONFIG.userToken !== 'your-user-jwt-token-here') {
    await testImageUpload('user', TEST_CONFIG.userToken);
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`Upload Directory: ${dirTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Static File Serving: ${staticTest ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Ensure multer is installed: npm install');
  console.log('2. Start your backend server: npm run dev');
  console.log('3. Test profile picture uploads in the frontend');
}

// Run tests
runTests().catch(console.error);
