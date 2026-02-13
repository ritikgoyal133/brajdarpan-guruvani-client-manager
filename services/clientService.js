/**
 * Client Service Layer
 * MongoDB-based service for client CRUD operations
 * Replaces file-based storage with MongoDB
 */

import Client from '../models/Client.js';

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
    throw error;
  }
}

/**
 * Check if client with same name and mobile already exists
 * @param {string} name - Client name
 * @param {string} mobile - Client mobile number
 * @param {string} excludeId - Client ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if duplicate exists
 */
export async function checkDuplicateClient(name, mobile, excludeId = null) {
  try {
    const query = {
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, // Case-insensitive exact match
      mobile: mobile.toString().trim()
    };
    
    // Exclude current client when updating
    if (excludeId) {
      query.id = { $ne: excludeId };
    }
    
    const existing = await Client.findOne(query);
    return !!existing;
  } catch (error) {
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
    // Check for duplicate (name + mobile combination)
    const isDuplicate = await checkDuplicateClient(clientData.name, clientData.mobile);
    if (isDuplicate) {
      const error = new Error('DUPLICATE_CLIENT');
      error.message = 'A client with the same name and mobile number already exists';
      throw error;
    }
    
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
    // Check for duplicate (name + mobile combination), excluding current client
    const isDuplicate = await checkDuplicateClient(clientData.name, clientData.mobile, id);
    if (isDuplicate) {
      const error = new Error('DUPLICATE_CLIENT');
      error.message = 'A client with the same name and mobile number already exists';
      throw error;
    }
    
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
    throw error;
  }
}

