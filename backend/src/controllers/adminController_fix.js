// This file contains the fixes needed for adminController.js
// Replace totalPrice with finalPrice in these locations:

// Line 210: Change from:
// { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
// To:
{ $group: { _id: null, totalRevenue: { $sum: '$finalPrice' } } },

// Line 273: Change from:
// .select('_id totalPrice createdAt userId professionalId')
// To:
.select('_id finalPrice createdAt userId professionalId')

// Line 305: Change from:
// const totalRevenue = jobs.reduce((sum, job) => sum + job.totalPrice, 0);
// To:
const totalRevenue = jobs.reduce((sum, job) => sum + job.finalPrice, 0);

// Also update the Transaction interface in FinancialManagement.tsx to use finalPrice instead of totalPrice
