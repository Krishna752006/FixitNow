# Admin Dashboard Troubleshooting Guide

## Issue: No Data Showing in Admin Dashboard

### Root Causes:
1. **No test data in database** - Database is empty
2. **Backend not returning data properly** - API endpoints not working
3. **Frontend not fetching data** - Network issues or wrong endpoints

---

## Solution: Create Test Data

### Step 1: Create Test Users & Professionals

Run this in your backend terminal:

```bash
cd backend
npm run create-admin
```

This creates:
- **Admin User:** admin@fixitnow.com / Admin@123456

### Step 2: Create Test Regular Users

Create a script: `backend/scripts/createTestData.js`

```javascript
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

    await mongoose.connection.close();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestData();
```

### Step 3: Add Script to package.json

```json
{
  "scripts": {
    "create-test-data": "node scripts/createTestData.js"
  }
}
```

### Step 4: Run Test Data Creation

```bash
cd backend
npm run create-test-data
```

---

## Verification Checklist

### 1. Check Backend is Running
```bash
# Terminal 1
cd backend
npm run start:dev
```

Expected output:
```
✅ MongoDB Connected
✅ Admin routes loaded
✅ Server running on port 5000
```

### 2. Check Frontend is Running
```bash
# Terminal 2
npm run dev
```

Expected output:
```
✅ Local: http://localhost:8080
```

### 3. Login to Admin Dashboard
1. Go to `http://localhost:8080/login/admin`
2. Enter: admin@fixitnow.com / Admin@123456
3. Click "Sign In as Admin"

### 4. Verify Each Tab

**Dashboard Tab:**
- Should show stats (users, professionals, jobs, revenue)

**Users Tab:**
- Should show customer@test.com and professional@test.com
- Both should be marked as "Verified" and "Active"

**Jobs Tab:**
- Should show 3 jobs with full details
- Click to expand and see all information

**Financial Tab:**
- Should show transactions
- Total Revenue: ₹1,250 (500 + 750 completed jobs)
- Platform Commission: ₹187.50 (15%)
- Professional Payouts: ₹1,062.50 (85%)

---

## If Still Not Working

### Check 1: Verify MongoDB Connection
```bash
# In backend terminal, check logs for:
✅ MongoDB Connected
```

### Check 2: Test API Endpoints Directly
```bash
# Test admin users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/users

# Test admin jobs endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/jobs

# Test financial endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/financial/transactions
```

### Check 3: Browser Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab to see API responses

### Check 4: Verify Backend Controller
Make sure `adminController.js` has been replaced with the fixed version:
- Line 210: Uses `$finalPrice` (not `$totalPrice`)
- Line 273: Uses `finalPrice` (not `totalPrice`)
- Line 305: Uses `finalPrice || 0` (not `totalPrice`)

---

## Complete Workflow

1. **Start Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Create Admin User:**
   ```bash
   npm run create-admin
   ```

3. **Create Test Data:**
   ```bash
   npm run create-test-data
   ```

4. **Start Frontend:**
   ```bash
   npm run dev
   ```

5. **Login to Admin:**
   - URL: http://localhost:8080/login/admin
   - Email: admin@fixitnow.com
   - Password: Admin@123456

6. **View Data:**
   - Dashboard → See stats
   - Users → See customer & professional
   - Jobs → See 3 test jobs
   - Financial → See transactions & revenue

---

## Expected Results After Setup

✅ **Dashboard Tab:**
- Total Users: 3 (admin, customer, professional)
- Total Professionals: 1
- Active Jobs: 1 (in_progress)
- Completed Jobs: 1
- Total Revenue: ₹1,250

✅ **Users Tab:**
- Shows all 3 users
- Verified and Active status visible
- Can verify/suspend users

✅ **Jobs Tab:**
- Shows 3 jobs with expandable details
- Full customer & professional info
- Location details
- Scheduled dates and times

✅ **Financial Tab:**
- Shows 2 transactions (completed jobs)
- Total Revenue: ₹1,250
- Platform Commission: ₹187.50
- Professional Payouts: ₹1,062.50

---

## Status: ✅ READY TO TEST

Follow these steps and your admin dashboard will be fully functional with real data!
