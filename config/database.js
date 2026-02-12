/**
 * MongoDB Database Connection
 * Connects to MongoDB Atlas using connection string from environment variable
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root (needed here because this module is imported early)
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Connect to MongoDB
 */
export async function connectDB() {
  try {
    console.log('[DATABASE] 🔗 Attempting to connect to MongoDB...', MONGODB_URI ? 'URI provided' : 'URI missing');
    // Check if MONGODB_URI is provided
    if (!MONGODB_URI) {
      console.error('[DATABASE] ❌ MONGODB_URI environment variable is not set!');
      console.error('[DATABASE] Please add MONGODB_URI to your .env file or environment variables.');
      console.error('[DATABASE] Format: MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/brajdarpan?retryWrites=true&w=majority');
      throw new Error('MONGODB_URI environment variable is required');
    }

    // Connection options
    const options = {
      // Remove deprecated options - mongoose 8.x handles these automatically
    };

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('[DATABASE] ✅ Connected to MongoDB successfully');
    console.log('[DATABASE] Database:', mongoose.connection.name);
    console.log('[DATABASE] Host:', mongoose.connection.host);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[DATABASE] ❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('[DATABASE] ⚠️  MongoDB disconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[DATABASE] MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[DATABASE] ❌ Failed to connect to MongoDB:', error.message);
    if (MONGODB_URI) {
      // Only try to hide credentials if URI exists
      try {
        const hiddenUri = MONGODB_URI.replace(/\/\/.*@/, '//***:***@');
        console.error('[DATABASE] Connection string:', hiddenUri);
      } catch (e) {
        console.error('[DATABASE] Connection string: [provided but invalid]');
      }
    }
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('[DATABASE] Disconnected from MongoDB');
  } catch (error) {
    console.error('[DATABASE] Error disconnecting:', error);
  }
}

