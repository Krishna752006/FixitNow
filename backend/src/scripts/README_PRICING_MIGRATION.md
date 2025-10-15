# Job Pricing Migration Script

## Overview
This script updates all existing jobs in the database with correct pricing based on their service names.

## What It Does
1. **Connects to MongoDB** using your `.env` configuration
2. **Fetches all jobs** from the database
3. **Matches each job** to correct pricing using:
   - Exact title match (e.g., "Faucet Repair/Replacement" → ₹45)
   - Partial title match (e.g., "Faucet Repair" → ₹45)
   - Category fallback (e.g., "Plumbing" → ₹1000)
4. **Updates the budget** field with correct min/max values
5. **Provides detailed logs** of all changes

## How to Run

### Step 1: Stop the Backend Server
Make sure your backend server is NOT running to avoid conflicts.

### Step 2: Run the Migration
```bash
cd backend
npm run update:pricing
```

### Step 3: Review the Output
The script will show:
- ✅ **Updated jobs** - Jobs that were updated with new pricing
- ⏭️ **Skipped jobs** - Jobs that already have correct pricing
- ⚠️ **Not found** - Jobs that couldn't be matched (manual review needed)

### Example Output:
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 25 jobs to process

✅ Updated: "Faucet Repair/Replacement" (Plumbing)
   Old: ₹500-₹1000 → New: ₹45 (exact title match)

✅ Updated: "AC Repair & Service" (HVAC)
   Old: ₹1500-₹1800 → New: ₹80 (exact title match)

⏭️  Skipped: "Drain Cleaning" - already has correct price (₹60)

⚠️  Not found: "Custom Service XYZ" (Other) - no pricing match

============================================================
📈 Migration Summary:
============================================================
Total jobs processed: 25
✅ Updated: 18
⏭️  Skipped (already correct): 5
⚠️  Not found (no pricing): 2
============================================================

🔌 Database connection closed
```

## Pricing Sources

### 1. Service-Specific Pricing (Primary)
Based on `CreateJob.tsx` service definitions:
- Plumbing: ₹45 - ₹400
- Electrical: ₹45 - ₹300
- Cleaning: ₹70 - ₹200
- And more...

### 2. Category Fallback (Secondary)
Based on `pricing.ts` category definitions:
- Plumbing: ₹1000
- Electrical: ₹1200
- HVAC: ₹1800
- And more...

## Safety Features
- ✅ **Read-only check first** - Compares before updating
- ✅ **Skips already correct** - Won't overwrite correct prices
- ✅ **Detailed logging** - Shows every change made
- ✅ **No data loss** - Only updates budget field
- ✅ **Reversible** - Can be run multiple times safely

## After Migration

### Step 1: Restart Backend Server
```bash
npm run dev
```

### Step 2: Verify in ProviderDashboard
1. Login as a professional
2. Check "Available Jobs" tab
3. Verify prices are now correct (₹45, ₹60, etc.)

### Step 3: Test New Jobs
1. Create a new job as a user
2. Check it appears with correct pricing for professionals

## Troubleshooting

### Issue: "Not found" warnings
**Solution**: These jobs have custom titles that don't match our pricing database. You can:
1. Manually update them in MongoDB
2. Add their titles to the `servicePricing` object in the script
3. Leave them with category fallback pricing

### Issue: Connection error
**Solution**: Check your `.env` file has correct `MONGODB_URI`

### Issue: Script hangs
**Solution**: Make sure MongoDB is running and accessible

## Manual Verification

To check a specific job in MongoDB:
```javascript
db.jobs.findOne({ title: "Faucet Repair/Replacement" })
```

Expected result:
```json
{
  "title": "Faucet Repair/Replacement",
  "category": "Plumbing",
  "budget": {
    "min": 45,
    "max": 45,
    "currency": "INR"
  }
}
```

## Need Help?
If you encounter issues or need to add more service pricing mappings, edit:
`backend/src/scripts/updateJobPricing.js`
