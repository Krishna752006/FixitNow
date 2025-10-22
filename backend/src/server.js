import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import loadEnvironment from './config/dotenv.js';
import connectDB from './config/database.js';
import config from './config/config.js';
import environment from './config/environment.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import jobRoutes from './routes/jobs.js';
import professionalRoutes from './routes/professional.js';
import professionalsRoutes from './routes/professionals.js';
import chatRoutes from './routes/chat.js';
import paymentsRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import forgotPasswordRoutes from './routes/forgotPassword.js';
import reviewsRoutes from './routes/reviews.js';
import favoritesRoutes from './routes/favorites.js';
import paymentRoutes from './routes/payment.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
loadEnvironment();

const app = express();
const PORT = environment.PORT;

// Connect to MongoDB (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const allowedOrigins = environment.CORS_ORIGINS;
console.log(' Allowed CORS Origins:', allowedOrigins);
console.log(' Environment:', {
  NODE_ENV: environment.NODE_ENV,
  IS_PRODUCTION: environment.IS_PRODUCTION,
  IS_RENDER: environment.IS_RENDER,
  FRONTEND_URL: environment.FRONTEND_URL
});

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      console.log(' No origin - allowing (mobile/Postman)');
      return callback(null, true);
    }
    
    console.log(' Checking origin:', origin);
    console.log(' Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      console.log(' Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log(' Origin blocked:', origin);
    console.log(' Tip: Add this origin to CORS_ORIGINS environment variable');
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use(morgan('combined'));

if (environment.IS_PRODUCTION) {
  app.use((req, res, next) => {
    console.log(` ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'None'}`);
    console.log(` Headers:`, {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? 'Present' : 'None',
      'user-agent': req.get('User-Agent')?.substring(0, 50) + '...'
    });
    next();
  });
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FixItNow Backend API is running',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: environment.NODE_ENV,
      IS_PRODUCTION: environment.IS_PRODUCTION,
      IS_RENDER: environment.IS_RENDER,
      CORS_ORIGINS_COUNT: environment.CORS_ORIGINS.length,
      CORS_ORIGINS: environment.CORS_ORIGINS,
      FRONTEND_URL: environment.FRONTEND_URL
    }
  });
});

app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    success: true,
    message: 'Available routes',
    routes: routes,
    totalRoutes: routes.length
  });
});

app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working correctly',
    origin: req.get('Origin') || 'No origin header',
    timestamp: new Date().toISOString(),
  });
});

console.log('🔗 Loading API routes...');
try {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
  app.use('/api/user', userRoutes);
  console.log('✅ User routes loaded');
  app.use('/api/jobs', jobRoutes);
  console.log('✅ Jobs routes loaded');
  app.use('/api/professional', professionalRoutes);
  console.log('✅ Professional routes loaded');
  app.use('/api/professionals', professionalsRoutes);
  console.log('✅ Professionals routes loaded');
  app.use('/api/chat', chatRoutes);
  console.log('✅ Chat routes loaded');
  app.use('/api/payments', paymentsRoutes);
  console.log('✅ Payments routes loaded');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
  app.use('/api/forgot-password', forgotPasswordRoutes);
  console.log('✅ Forgot password routes loaded');
  app.use('/api/reviews', reviewsRoutes);
  console.log('✅ Reviews routes loaded');
  app.use('/api/favorites', favoritesRoutes);
  console.log('✅ Favorites routes loaded');
  app.use('/api/payment', paymentRoutes);
  console.log('✅ Payment routes loaded');
  console.log('🎉 All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
