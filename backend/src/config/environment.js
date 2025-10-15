// Backend Environment Configuration
// Automatically detects environment and sets appropriate URLs

// Detect if we're running on Render
const isRenderDeployment = () => {
  return (
    process.env.RENDER === 'true' ||
    process.env.RENDER_SERVICE_NAME ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.NODE_ENV === 'production' && process.env.PORT)
  );
};

// Detect if we're in production
const isProduction = () => {
  return (
    process.env.NODE_ENV === 'production' ||
    isRenderDeployment()
  );
};

// Get the appropriate frontend URL for CORS
const getFrontendUrl = () => {
  // Check environment variable first
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // If on Render deployment, use Vercel URL (since frontend is on Vercel)
  if (isRenderDeployment()) {
    return 'https://fixitnow-rho.vercel.app';
  }
  
  // Default to localhost for development
  return 'http://localhost:8080';
};

// Get all allowed CORS origins
const getCorsOrigins = () => {
  const defaultOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:5173',
  ];
  
  // Add production origins
  const productionOrigins = [
    'https://fixitnow-rho.vercel.app',
    'https://fixit-37b4.onrender.com',
  ];
  
  // Add custom origins from environment
  const envOrigins = (process.env.CORS_ORIGINS || '').split(',')
    .map(s => s.trim())
    .filter(Boolean);
  
  // Combine and deduplicate
  const allOrigins = [...new Set([...defaultOrigins, ...productionOrigins, ...envOrigins])];
  
  return allOrigins;
};

// Create environment configuration
const environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  IS_PRODUCTION: isProduction(),
  IS_DEVELOPMENT: !isProduction(),
  IS_RENDER: isRenderDeployment(),
  
  // URLs
  FRONTEND_URL: getFrontendUrl(),
  CORS_ORIGINS: getCorsOrigins(),
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  
  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-key',
};

// Log current environment (only in development)
if (environment.IS_DEVELOPMENT) {
  console.log('🌍 Backend Environment Configuration:', {
    NODE_ENV: environment.NODE_ENV,
    PORT: environment.PORT,
    IS_PRODUCTION: environment.IS_PRODUCTION,
    IS_RENDER: environment.IS_RENDER,
    FRONTEND_URL: environment.FRONTEND_URL,
    CORS_ORIGINS: environment.CORS_ORIGINS,
  });
}

export default environment;
