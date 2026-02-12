import { v4 as uuidv4 } from 'uuid';
import {
  readClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  searchClients
} from '../services/clientService.js';

// Get all clients
export async function getAllClients(req, res) {
  try {
    const clients = await readClients();
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch clients' });
  }
}

// Get client by ID
export async function getClient(req, res) {
  try {
    const { id } = req.params;
    const client = await getClientById(id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch client' });
  }
}

// Create new client
export async function createClient(req, res) {
  try {
    const {
      name,
      email,
      address,
      mobile,
      dob,
      birthTime,
      dot,
      problemStatement,
      gender,
      chargeableAmount,
      paidAmount
    } = req.body;
    
    // Validation - Required: name, gender, mobile, dob, birthTime, dot
    const errors = [];
    if (!name) errors.push('Name');
    if (!gender) errors.push('Gender');
    if (!mobile) errors.push('Mobile Number');
    if (!dob) errors.push('Date of Birth');
    if (!birthTime) errors.push('Birth Time');
    if (!dot) errors.push('Date of Visit');
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields missing: ${errors.join(', ')}`
      });
    }
    
    const clientData = {
      id: uuidv4(),
      name: name.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      mobile: mobile.toString().trim(),
      dob: dob,
      birthTime: birthTime,
      dot: dot,
      problemStatement: problemStatement ? problemStatement.trim() : '',
      gender: gender,
      chargeableAmount: chargeableAmount ? parseFloat(chargeableAmount) : 0,
      paidAmount: paidAmount ? parseFloat(paidAmount) : 0
    };
    
    const newClient = await addClient(clientData);
    res.status(201).json({ success: true, data: newClient, message: 'Client added successfully' });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: 'Failed to create client' });
  }
}

// Update existing client
export async function updateClientController(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      address,
      mobile,
      dob,
      birthTime,
      dot,
      problemStatement,
      gender,
      chargeableAmount,
      paidAmount
    } = req.body;
    
    // Validation - Required: name, gender, mobile, dob, birthTime, dot
    const errors = [];
    if (!name) errors.push('Name');
    if (!gender) errors.push('Gender');
    if (!mobile) errors.push('Mobile Number');
    if (!dob) errors.push('Date of Birth');
    if (!birthTime) errors.push('Birth Time');
    if (!dot) errors.push('Date of Visit');
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields missing: ${errors.join(', ')}`
      });
    }
    
    const clientData = {
      name: name.trim(),
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      mobile: mobile.toString().trim(),
      dob: dob,
      birthTime: birthTime,
      dot: dot,
      problemStatement: problemStatement ? problemStatement.trim() : '',
      gender: gender,
      chargeableAmount: chargeableAmount ? parseFloat(chargeableAmount) : 0,
      paidAmount: paidAmount ? parseFloat(paidAmount) : 0
    };
    
    const updatedClient = await updateClient(id, clientData);
    
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.json({ success: true, data: updatedClient, message: 'Client updated successfully' });
  } catch (error) {
    console.error('[UPDATE_CLIENT] Error updating client:', error);
    console.error('[UPDATE_CLIENT] Error details:', {
      message: error.message,
      stack: error.stack,
      id: req.params.id,
      body: req.body
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update client',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete client
export async function deleteClientController(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteClient(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Failed to delete client' });
  }
}

// Search clients
export async function searchClientsController(req, res) {
  try {
    const { name, mobile, date, gender } = req.query;
    const query = {};
    
    if (name) query.name = name;
    if (mobile) query.mobile = mobile;
    if (date) query.date = date;
    if (gender) query.gender = gender;
    
    const clients = await searchClients(query);
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ success: false, message: 'Failed to search clients' });
  }
}

