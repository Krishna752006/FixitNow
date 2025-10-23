import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.warn('⚠️ MONGODB_URI is not defined in environment variables');
      console.log('📝 Server will start but database features will be limited');
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
      } catch (err) {
        console.error('Error closing MongoDB:', err);
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️ Server will start but database features will be limited');
    console.log('💡 Make sure MongoDB is running and MONGODB_URI is correct');
  }
};

export default connectDB;
