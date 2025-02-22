import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getAppointmentDetails } from '../controllers/appointment.controller.js';

const router = express.Router();

router.get('/doctor/appointment/:appointmentId', authMiddleware, getAppointmentDetails);

export default router;
