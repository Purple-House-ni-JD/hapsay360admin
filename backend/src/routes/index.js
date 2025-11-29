import express from 'express';
import authRoutes from './auth.routes.js';
import policeStationRoutes from './policeStation.routes.js';
import usersRoutes from './users.routes.js';
import blotterRoutes from './blotter.routes.js';
import clearanceRoutes from './clearance.routes.js';
import officerRoutes from './officer.routes.js';

const router = express.Router();

// Auth routes
router.use('/auth', authRoutes);

// Police station routes
router.use('/stations', policeStationRoutes);

// Officers routes 
router.use('/officers', officerRoutes);  

// Users routes
router.use('/users', usersRoutes);

// Blotter routes
router.use('/blotter', blotterRoutes);

// Clearance routes
router.use('/clearance', clearanceRoutes);

export default router;