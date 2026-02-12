/**
 * Client Service Layer
 * MongoDB-based service for client CRUD operations
 * Replaces file-based storage with MongoDB
 */

import Client from '../models/Client.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Read all clients from database
 * @returns {Promise<Array>} Array of client objects
 */
export async function readClients() {
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 }).lean();
    // Convert MongoDB documents to plain objects and format dates
    return clients.map(client => ({
      ...client,
      createdAt: client.createdAt ? new Date(client.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: client.updatedAt ? new Date(client.updatedAt).toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('[CLIENT_SERVICE] Error reading clients:', error);
    throw error;
  }
}

/**
 * Get client by ID
 * @param {string} id - Client UUID
 * @returns {Promise<Object|null>} Client object or null
 */
export async function getClientById(id) {
  try {
    const client = await Client.findOne({ id }).lean();
    if (!client) {
      return null;
    }
    return {
      ...client,
      createdAt: client.createdAt ? new Date(client.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: client.updatedAt ? new Date(client.updatedAt).toISOString() : new Date().toISOString()
    };
  } catch (error) {
    console.error('[CLIENT_SERVICE] Error getting client by ID:', error);
    throw error;
  }
}

/**
 * Add new client
 * @param {Object} clientData - Client data object
 * @returns {Promise<Object>} Created client object
 */
export async function addClient(clientData) {
  try {
    const newClient = new Client({
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedClient = await newClient.save();
    const clientObj = savedClient.toObject();
    
    return {
      ...clientObj,
      createdAt: new Date(clientObj.createdAt).toISOString(),
      updatedAt: new Date(clientObj.updatedAt).toISOString()
    };
  } catch (error) {
    console.error('[CLIENT_SERVICE] Error adding client:', error);
    throw error;
  }
}

/**
 * Update existing client
 * @param {string} id - Client UUID
 * @param {Object} clientData - Updated client data
 * @returns {Promise<Object|null>} Updated client object or null
 */
export async function updateClient(id, clientData) {
  try {
    const updatedClient = await Client.findOneAndUpdate(
      { id },
      {
        ...clientData,
        updatedAt: new Date()
      },
      {
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).lean();
    
    if (!updatedClient) {
      return null;
    }
    
    return {
      ...updatedClient,
      createdAt: updatedClient.createdAt ? new Date(updatedClient.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: new Date(updatedClient.updatedAt).toISOString()
    };
  } catch (error) {
    console.error('[CLIENT_SERVICE] Error updating client:', error);
    throw error;
  }
}

/**
 * Delete client by ID
 * @param {string} id - Client UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteClient(id) {
  try {
    const result = await Client.deleteOne({ id });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('[CLIENT_SERVICE] Error deleting client:', error);
    throw error;
  }
}

/**
 * Search clients by query
 * @param {Object} query - Search parameters (name, mobile, gender)
 * @returns {Promise<Array>} Filtered array of clients
 */
export async function searchClients(query) {
  try {
    const searchQuery = {};
    
    // Search by name (case-insensitive partial match)
    if (query.name) {
      searchQuery.name = { $regex: query.name, $options: 'i' };
    }
    
    // Search by mobile (partial match)
    if (query.mobile) {
      searchQuery.mobile = { $regex: query.mobile };
    }
    
    // Search by gender (exact match)
    if (query.gender) {
      searchQuery.gender = query.gender;
    }
    
    // Note: Date filter was removed per user request
    
    const clients = await Client.find(searchQuery).sort({ createdAt: -1 }).lean();
    
    return clients.map(client => ({
      ...client,
      createdAt: client.createdAt ? new Date(client.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: client.updatedAt ? new Date(client.updatedAt).toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('[CLIENT_SERVICE] Error searching clients:', error);
    throw error;
  }
}

// Legacy function names for compatibility (if needed)
export async function writeClients(clients) {
  // This function is not needed with MongoDB, but kept for compatibility
  console.warn('[CLIENT_SERVICE] writeClients called - not needed with MongoDB');
  return clients;
}

