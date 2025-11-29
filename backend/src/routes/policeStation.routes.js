import express from 'express';
import { createPoliceStation, getStations, updatePoliceStation, deletePoliceStation } from '../controllers/policeStation.controller.js';

const router = express.Router();

router.post('/create', createPoliceStation);
router.get('/getStations', getStations);
router.put('/update/:id', updatePoliceStation);
router.delete('/:id', deletePoliceStation);

export default router;