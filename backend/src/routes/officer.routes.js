import express from 'express';
import {
    getAllOfficers,
    getOfficerById,
    createOfficer,
    updateOfficer,
    deleteOfficer,
    getOfficersByStation,
    updateOfficerStatus
} from '../controllers/officer.controller.js';

const router = express.Router();

// Get all officers
router.get('/', getAllOfficers);

// Get officers by station
router.get('/station/:stationId', getOfficersByStation);

// Get single officer by ID
router.get('/:id', getOfficerById);

// Create new officer
router.post('/', createOfficer);

// Update officer
router.put('/:id', updateOfficer);

// Update officer status
router.patch('/:id/status', updateOfficerStatus);

// Delete officer
router.delete('/:id', deleteOfficer);

export default router;