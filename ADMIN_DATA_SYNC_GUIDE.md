# Admin Dashboard - Data Synchronization Guide

## ✅ Status: FULLY OPERATIONAL

All user data, provider data, financial data, and analytics are synced in real-time to the admin dashboard.

---

## 🚀 Quick Start

### 1. Login to Admin Portal
```
URL: http://localhost:8080/login/admin
Email: admin@fixitnow.com
Password: Admin@123456
```

### 2. Access Dashboard
After login, you'll see the admin dashboard at `/admin` with:
- Dashboard stats overview
- Navigation tabs for different sections
- Real-time data from MongoDB

---

## 📊 Data Sections & What's Synced

### Dashboard Overview
**Endpoint:** `GET /api/admin/dashboard/stats`

Shows real-time statistics:
- **Total Users** - Count of all regular users
- **Total Professionals** - Count of all service providers
- **Active Jobs** - Jobs in pending, accepted, or in_progress status
- **Completed Jobs** - Successfully finished jobs
- **Total Revenue** - Sum of all completed job prices

---

### Users Management
**Endpoint:** `GET /api/admin/users`

**Synced Data:**
- First Name & Last Name
- Email Address
- Phone Number
- User Type (user/professional)
- Verification Status
- Account Status (active/suspended)
- Created Date

**Available Actions:**
- ✅ Search users by name or email
- ✅ Filter by user type
- ✅ Verify/unverify accounts
- ✅ Suspend/reactivate accounts
- ✅ Pagination (10 users per page)

**API Calls:**
```
GET /api/admin/users?search=john&userType=user&page=1&limit=10
PATCH /api/admin/users/:id/verify
PATCH /api/admin/users/:id/suspend
PATCH /api/admin/users/:id/reactivate
```

---

### Professionals Management
**Endpoint:** `GET /api/admin/users?userType=professional`

**Synced Data:**
- Professional Name
- Email & Phone
- Services Offered
- Experience Level
- Verification Status
- Rating & Reviews
- Account Status

**Available Actions:**
- ✅ View all professionals
- ✅ Search professionals
- ✅ Verify/unverify
- ✅ Suspend/reactivate
- ✅ Reassign jobs

---

### Job Monitoring
**Endpoint:** `GET /api/admin/jobs`

**Synced Data:**
- Job ID & Title
- User Name & Email
- Professional Name & Email
- Category & Description
- Job Status (pending, accepted, in_progress, completed, cancelled)
- Price & Payment Status
- Created & Updated Dates

**Available Filters:**
- Filter by status
- Search by job ID
- Pagination support

**Status Color Coding:**
- 🟡 **Pending** - Waiting for professional to accept
- 🔵 **Accepted** - Professional accepted the job
- 🟣 **In Progress** - Work is ongoing
- 🟢 **Completed** - Job finished
- 🔴 **Cancelled** - Job was cancelled

---

### Financial Management
**Endpoints:**
- `GET /api/admin/financial/transactions`
- `GET /api/admin/financial/report`

**Transaction History:**
- Job ID & Title
- Amount Paid
- Payment Method
- Professional Name
- User Name
- Payment Date
- Status

**Financial Report Shows:**
- **Total Revenue** - All money from completed jobs
- **Platform Commission** - 15% of total revenue
- **Professional Payouts** - 85% paid to professionals
- **Total Jobs** - Number of completed jobs

**Date Range Filtering:**
- Filter by start date
- Filter by end date
- Generate custom reports

---

### Service Configuration
**Endpoint:** `GET /api/admin/services/categories`

**Synced Data:**
- Service Category Names
- Base Prices
- Descriptions
- Number of Professionals per category

**Available Actions:**
- ✅ View all services
- ✅ Add new service categories
- ✅ Set pricing
- ✅ Add descriptions

---

### Analytics & Insights
**Endpoint:** `GET /api/admin/analytics/data`

**Metrics Displayed:**
- **Average Job Completion Time** - How long jobs take on average
- **Professional Acceptance Rate** - % of jobs accepted by professionals
- **Job Completion Rate** - % of jobs successfully completed
- **Customer Satisfaction** - Average rating/satisfaction
- **Professional Retention** - % of professionals staying active

---

### Audit Log
**Endpoint:** `GET /api/admin/audit-log`

**Tracked Actions:**
- Admin login/logout
- User verification changes
- Account suspensions
- Job reassignments
- Financial transactions
- Service configuration changes

**Features:**
- Filter by action type
- View timestamp
- See which admin performed action
- Pagination support

---

## 🔄 Real-Time Data Sync

### How It Works:

1. **Component Mounts** → Fetches data from API
2. **User Interacts** → Performs action (verify, suspend, etc.)
3. **API Call** → Backend updates MongoDB
4. **Data Refreshes** → Component fetches latest data
5. **UI Updates** → Shows new data immediately

### Automatic Refresh Triggers:
- Page/filter changes
- User actions (verify, suspend, etc.)
- Tab switching
- Manual refresh

---

## 🔐 Authentication & Security

### Token Management:
- JWT token stored in localStorage
- Automatically added to all API requests
- Token expires after 7 days
- Admin middleware validates `isAdmin: true` flag

### Protected Endpoints:
All admin endpoints require:
1. Valid JWT token
2. `isAdmin: true` flag on user account
3. Account must be active (not suspended)

---

## 📱 Data Pagination

All list endpoints support pagination:

```
?page=1&limit=10
```

- Default limit: 10 items per page
- Adjustable via limit parameter
- Total count returned in response

---

## 🛠️ API Endpoints Reference

### Dashboard
```
GET /api/admin/dashboard/stats
```

### Users
```
GET /api/admin/users
GET /api/admin/users/:id
PATCH /api/admin/users/:id/verify
PATCH /api/admin/users/:id/suspend
PATCH /api/admin/users/:id/reactivate
```

### Jobs
```
GET /api/admin/jobs
GET /api/admin/jobs/:id
PATCH /api/admin/jobs/:id/reassign
```

### Services
```
GET /api/admin/services/categories
POST /api/admin/services/categories
```

### Financial
```
GET /api/admin/financial/transactions
GET /api/admin/financial/report
```

### Analytics
```
GET /api/admin/analytics/data
```

### Audit Log
```
GET /api/admin/audit-log
```

---

## 🧪 Testing the Data Sync

### Step 1: Create Test Data
1. Sign up as a regular user
2. Sign up as a professional
3. Create a job as user
4. Accept job as professional

### Step 2: Login as Admin
1. Go to http://localhost:8080/login/admin
2. Enter admin credentials
3. View dashboard

### Step 3: Verify Data Sync
- **Dashboard Tab** → See stats update
- **Users Tab** → See both users listed
- **Jobs Tab** → See the job with status
- **Financial Tab** → See transaction (after job completion)
- **Analytics Tab** → See metrics

### Step 4: Test Actions
- Verify a user → Check if status changes
- Suspend a user → Check if they can't login
- Filter jobs by status → See filtering works
- Generate financial report → See calculations

---

## 📋 Data Models

### User Data Structure
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  userType: 'user' | 'professional',
  isVerified: Boolean,
  isActive: Boolean,
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Data Structure
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  professionalId: ObjectId,
  category: String,
  description: String,
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled',
  totalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Data Structure
```javascript
{
  _id: ObjectId,
  jobId: ObjectId,
  userId: ObjectId,
  professionalId: ObjectId,
  amount: Number,
  paymentMethod: String,
  status: 'pending' | 'paid' | 'verified',
  createdAt: Date
}
```

---

## ⚠️ Troubleshooting

### Data Not Loading?
1. Check if backend is running: `npm run start:dev` in backend folder
2. Verify MongoDB connection
3. Check browser console for errors
4. Verify JWT token in localStorage

### Can't Access Admin Dashboard?
1. Ensure you're logged in as admin user
2. Check if user has `isAdmin: true` in database
3. Verify token is not expired
4. Try logging out and logging back in

### Data Not Updating?
1. Check network tab in browser DevTools
2. Verify API endpoints are correct
3. Check backend logs for errors
4. Try manual page refresh

---

## 📞 Support

For issues or questions:
1. Check backend logs: `npm run start:dev`
2. Check browser console: F12 → Console tab
3. Verify MongoDB connection
4. Check API endpoints in `backend/src/routes/admin.js`

---

## ✨ Features Summary

✅ Real-time user data sync
✅ Professional data management
✅ Complete job tracking
✅ Financial reporting & analytics
✅ Service configuration
✅ Audit logging
✅ Search & filtering
✅ Pagination
✅ Role-based access control
✅ Responsive design
✅ Error handling
✅ Loading states

---

**Last Updated:** October 23, 2025
**Status:** ✅ Production Ready
