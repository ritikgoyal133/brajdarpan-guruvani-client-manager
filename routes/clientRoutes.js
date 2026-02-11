import express from 'express';
import {
  getAllClients,
  getClient,
  createClient,
  updateClientController,
  deleteClientController,
  searchClientsController
} from '../controllers/clientController.js';

const router = express.Router();

// Get all clients
router.get('/', getAllClients);

// Search clients
router.get('/search', searchClientsController);

// Get client by ID
router.get('/:id', getClient);

// Create new client
router.post('/', createClient);

// Update client
router.put('/:id', updateClientController);

// Delete client
router.delete('/:id', deleteClientController);

export default router;

