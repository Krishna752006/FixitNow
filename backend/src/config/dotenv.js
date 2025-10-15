// Environment Variable Loader
// Loads appropriate .env file based on NODE_ENV

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, '../..');

// Load environment variables based on NODE_ENV
const loadEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log(`🌍 Loading environment for: ${nodeEnv}`);
  
  // Try to load environment-specific file first
  const envFile = join(backendRoot, `.env.${nodeEnv}`);
  if (existsSync(envFile)) {
    console.log(`📁 Loading environment file: .env.${nodeEnv}`);
    config({ path: envFile });
  } else {
    console.log(`⚠️  Environment file .env.${nodeEnv} not found`);
  }
  
  // Always try to load .env as fallback
  const defaultEnvFile = join(backendRoot, '.env');
  if (existsSync(defaultEnvFile)) {
    console.log(`📁 Loading fallback environment file: .env`);
    config({ path: defaultEnvFile, override: false }); // Don't override existing vars
  }
  
  // Validate required environment variables
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please check your .env files');
    process.exit(1);
  }
  
  console.log('✅ Environment variables loaded successfully');
};

export default loadEnvironment;
