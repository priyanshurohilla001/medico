import express from 'express';
import authDoctor from '../services/authDoctor.js';
import {createAppointment} from '../controllers/appointment.controller.js';

const router = express.Router();


router.post('/create', authDoctor , createAppointment);


export default router;
