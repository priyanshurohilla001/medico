import express from 'express';
import authDoctor from '../services/authDoctor.js';
import {
    createAppointment,
    deleteUnbookedAppointment,
    cancelBookedAppointment,
    getConfirmedAppointments,
    getAvailableAppointments
} from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/create', authDoctor, createAppointment);          // Create an available slot
router.get('/available', authDoctor, getAvailableAppointments);   // Get available slots
router.get('/confirmed', authDoctor, getConfirmedAppointments);   // Get confirmed appointments
router.delete('/:id', authDoctor, deleteUnbookedAppointment);     // Delete an available slot
router.put('/:id/cancel', authDoctor, cancelBookedAppointment);   // Cancel a confirmed appointment

export default router;
