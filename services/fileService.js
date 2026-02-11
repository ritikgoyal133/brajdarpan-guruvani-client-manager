import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Read clients from JSON file
 * @returns {Promise<Array>} Array of client objects
 */
export async function readClients() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CLIENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      await ensureDataDir();
      await fs.writeFile(CLIENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    throw error;
  }
}

/**
 * Write clients to JSON file
 * @param {Array} clients - Array of client objects
 */
export async function writeClients(clients) {
  try {
    await ensureDataDir();
    // Write atomically by writing to temp file first, then renaming
    const tempFile = `${CLIENTS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(clients, null, 2), 'utf-8');
    await fs.rename(tempFile, CLIENTS_FILE);
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(`${CLIENTS_FILE}.tmp`);
    } catch {}
    throw error;
  }
}

/**
 * Get client by ID
 * @param {string} id - Client UUID
 * @returns {Promise<Object|null>} Client object or null
 */
export async function getClientById(id) {
  const clients = await readClients();
  return clients.find(client => client.id === id) || null;
}

/**
 * Add new client
 * @param {Object} clientData - Client data object
 * @returns {Promise<Object>} Created client object
 */
export async function addClient(clientData) {
  const clients = await readClients();
  const newClient = {
    ...clientData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  clients.push(newClient);
  await writeClients(clients);
  return newClient;
}

/**
 * Update existing client
 * @param {string} id - Client UUID
 * @param {Object} clientData - Updated client data
 * @returns {Promise<Object|null>} Updated client object or null
 */
export async function updateClient(id, clientData) {
  const clients = await readClients();
  const index = clients.findIndex(client => client.id === id);
  
  if (index === -1) {
    return null;
  }
  
  clients[index] = {
    ...clients[index],
    ...clientData,
    updatedAt: new Date().toISOString()
  };
  
  await writeClients(clients);
  return clients[index];
}

/**
 * Delete client by ID
 * @param {string} id - Client UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteClient(id) {
  const clients = await readClients();
  const initialLength = clients.length;
  const filteredClients = clients.filter(client => client.id !== id);
  
  if (filteredClients.length === initialLength) {
    return false;
  }
  
  await writeClients(filteredClients);
  return true;
}

/**
 * Search clients by query
 * @param {Object} query - Search parameters (name, mobile, date, gender)
 * @returns {Promise<Array>} Filtered array of clients
 */
export async function searchClients(query) {
  const clients = await readClients();
  let filtered = [...clients];
  
  if (query.name) {
    const nameLower = query.name.toLowerCase();
    filtered = filtered.filter(client => 
      client.name && client.name.toLowerCase().includes(nameLower)
    );
  }
  
  if (query.mobile) {
    const mobileStr = query.mobile.toString();
    filtered = filtered.filter(client => 
      client.mobile && client.mobile.toString().includes(mobileStr)
    );
  }
  
  if (query.date) {
    // Search in both dob and dot
    filtered = filtered.filter(client => 
      client.dob === query.date || client.dot === query.date
    );
  }
  
  if (query.gender) {
    filtered = filtered.filter(client => 
      client.gender === query.gender
    );
  }
  
  return filtered;
}

