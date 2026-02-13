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
    // Check if MONGODB_URI is provided
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    
    console.log('[DATABASE] Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[DATABASE] Connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.error('[DATABASE] Disconnected from MongoDB');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[DATABASE] Failed to connect:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('[DATABASE] Error disconnecting:', error.message);
  }
}

