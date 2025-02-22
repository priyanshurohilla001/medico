import express from 'express';
import authDoctor from '../services/authDoctor.js';
import {
    createAppointment,
    deleteUnbookedAppointment,
    cancelBookedAppointment,
    getConfirmedAppointments,
    getAvailableAppointments,
    confirmAppointment
} from '../controllers/appointment.controller.js';
import authPatient from '../services/authPatient.js';
const router = express.Router();

router.post('/create', authDoctor, createAppointment);
router.get('/available', authDoctor, getAvailableAppointments);
router.get('/confirmed', authDoctor, getConfirmedAppointments);
router.delete('/:id', authDoctor, deleteUnbookedAppointment);
router.put('/:id/cancel', authDoctor, cancelBookedAppointment);
router.post('/confirm', authPatient, confirmAppointment);


export default router;
