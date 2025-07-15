import mongoose from "mongoose";

let cachedConnection = null;

export const connectToDatabase = async () => {
  // If we already have a cached connection, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      // Optimized settings for serverless/Vercel
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      
      // Additional optimizations for Vercel
      connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
      family: 4, // Use IPv4, skip trying IPv6
    });

    cachedConnection = connection;
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// For graceful shutdown (won't be called in serverless but good practice)
export const disconnectFromDatabase = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
};
