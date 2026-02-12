/**
 * Client Model
 * MongoDB schema for client records
 */

import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: String,
    required: true
  },
  birthTime: {
    type: String,
    required: true
  },
  dot: {
    type: String,
    required: true
  },
  problemStatement: {
    type: String,
    default: '',
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  chargeableAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We're managing createdAt/updatedAt manually
});

// Update updatedAt before saving
clientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for search performance
clientSchema.index({ name: 'text', mobile: 'text' });
clientSchema.index({ gender: 1 });
clientSchema.index({ mobile: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;

