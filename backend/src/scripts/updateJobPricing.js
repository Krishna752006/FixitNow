import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

// Service pricing mapping based on CreateJob.tsx
const servicePricing = {
  // Plumbing
  'Faucet Repair/Replacement': 45,
  'Drain Cleaning': 60,
  'Toilet Repair': 55,
  'Pipe Repair': 75,
  'Water Heater Installation': 250,
  'Sewer Line Repair': 400,
  'Garbage Disposal Installation': 85,
  'Shower/Bathtub Installation': 350,
  
  // Electrical
  'Outlet Installation': 65,
  'Light Fixture Installation': 80,
  'Light Fixture Replacement': 65,
  'Switch Replacement': 45,
  'Circuit Breaker Repair': 85,
  'Wiring Repair': 120,
  'Ceiling Fan Installation': 90,
  'Electrical Panel Upgrade': 300,
  'Smart Home Wiring': 180,
  'Outdoor Lighting Installation': 150,
  
  // Cleaning
  'Deep House Cleaning': 120,
  'Deep Cleaning': 120,
  'Regular Cleaning': 80,
  'Carpet Cleaning': 90,
  'Pest Control': 80,
  'Window Cleaning': 70,
  'Move In/Out Cleaning': 150,
  'Move-In/Move-Out Cleaning': 200,
  'Upholstery Cleaning': 100,
  'Pressure Washing': 120,
  'Gutter Cleaning': 65,
  
  // Painting
  'Interior Painting': 200,
  'Interior Wall Painting': 300,
  'Exterior Painting': 300,
  'Waterproofing': 250,
  'Texture Painting': 350,
  'Cabinet Painting': 250,
  'Deck Staining': 220,
  'Wallpaper Installation': 200,
  'Drywall Repair & Painting': 180,
  
  // Carpentry
  'Furniture Assembly': 60,
  'Door Installation': 95,
  'Cabinet Installation': 150,
  'Custom Woodwork': 200,
  'Custom Shelves': 150,
  'Deck Building': 800,
  'Deck Repair': 120,
  'Crown Molding Installation': 180,
  'Closet Organization System': 250,
  'Trim & Baseboard Installation': 160,
  'Furniture Repair': 80,
  
  // Appliance Repair
  'Refrigerator Repair': 85,
  'Washing Machine Repair': 75,
  'Microwave Repair': 55,
  'Dishwasher Repair': 70,
  'Dryer Repair': 80,
  'Oven/Stove Repair': 90,
  'Garbage Disposal Repair': 60,
  'Ice Maker Repair': 65,
  
  // HVAC
  'AC Installation': 200,
  'AC Repair & Service': 80,
  'AC Repair': 120,
  'Heater Repair': 90,
  'Duct Cleaning': 120,
  'Furnace Installation': 350,
  'Furnace Service': 90,
  'Thermostat Installation': 75,
  'Air Quality Testing': 100,
  'Heat Pump Service': 110,
  
  'Lawn Mowing': 40,
  'Garden Design': 150,
  'Tree Trimming': 100,
  'Irrigation System': 180,
  'Mulching & Edging': 80,
  'Sod Installation': 300,
  'Hedge Trimming': 70,
  'Leaf Removal': 60,
  
  'General Repairs': 60,
  'TV Mounting': 70,
  'Shelf Installation': 50,
  'Picture Hanging': 40,
  'Drywall Patching': 55,
  'Drywall Repair': 60,
  'Door Repair': 50,
  'Door Lock Installation': 65,
  'Caulking & Sealing': 45,
  'Minor Plumbing Fixes': 60,
  'Minor Plumbing': 55,
  
  'Oil Change': 50,
  'Brake Service': 120,
  'Battery Replacement': 80,
  
  'Lock Installation': 70,
  'Key Duplication': 15,
  'Emergency Lockout': 100,
  
  'Moving Service': 300,
  'Local Moving': 200,
  'Packing Service': 150,
  'Loading/Unloading': 100,
  'Furniture Moving': 120,
  'Furniture Delivery': 90,
  'Storage Solutions': 100,
  'Junk Removal': 140,
  'Home Organization': 110,
  'Assembly Service': 70,
  
  'General Pest Control': 80,
  'Rodent Control': 100,
  'Termite Inspection': 60,
  
  'Dog Walking': 25,
  'Pet Sitting': 50,
  'Pet Grooming': 60,
  
  'Security Camera Installation': 120,
  'Alarm System Setup': 150,
  'Smart Lock Installation': 100,
};

const categoryFallbackPricing = {
  'Plumbing': 1000,
  'Electrical': 1200,
  'Cleaning': 500,
  'Painting': 800,
  'Carpentry': 1100,
  'Appliance Repair': 900,
  'HVAC': 1800,
  'Landscaping': 600,
  'Handyman': 600,
  'Other': 500,
  'Auto Repair': 900,
  'Locksmith': 800,
  'Moving': 1500,
  'Pest Control': 700,
  'Pet Care': 350,
  'Security': 950,
};

async function updateJobPricing() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const jobs = await Job.find({});
    console.log(`\n📊 Found ${jobs.length} jobs to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    for (const job of jobs) {
      let newPrice = null;
      let source = '';

      if (servicePricing[job.title]) {
        newPrice = servicePricing[job.title];
        source = 'exact title match';
      }
      else {
        const titleLower = job.title.toLowerCase();
        const matchedKey = Object.keys(servicePricing).find(key => 
          titleLower.includes(key.toLowerCase()) || key.toLowerCase().includes(titleLower)
        );
        
        if (matchedKey) {
          newPrice = servicePricing[matchedKey];
          source = `partial match: "${matchedKey}"`;
        }
        else if (categoryFallbackPricing[job.category]) {
          newPrice = categoryFallbackPricing[job.category];
          source = 'category fallback';
        }
      }

      if (newPrice) {
        const oldMin = job.budget?.min || 0;
        const oldMax = job.budget?.max || 0;

        if (oldMin !== newPrice || oldMax !== newPrice) {
          job.budget = {
            min: newPrice,
            max: newPrice,
            currency: 'INR'
          };
          await job.save();
          
          console.log(`✅ Updated: "${job.title}" (${job.category})`);
          console.log(`   Old: ₹${oldMin}-₹${oldMax} → New: ₹${newPrice} (${source})`);
          updatedCount++;
        } else {
          console.log(`⏭️  Skipped: "${job.title}" - already has correct price (₹${newPrice})`);
          skippedCount++;
        }
      } else {
        console.log(`⚠️  Not found: "${job.title}" (${job.category}) - no pricing match`);
        notFoundCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total jobs processed: ${jobs.length}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (already correct): ${skippedCount}`);
    console.log(`⚠️  Not found (no pricing): ${notFoundCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error updating job pricing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
updateJobPricing();
