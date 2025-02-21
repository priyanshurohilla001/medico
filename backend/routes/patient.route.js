import express from 'express';
import { 
  registerPatient,
  loginPatient,
  getPatientProfile,
  updatePatientProfile,
  changePassword
} from '../controllers/patient.controller.js';
import authPatient from '../services/authPatient.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/profile', authPatient, getPatientProfile);
router.put('/profile', authPatient, updatePatientProfile);
router.put('/change-password', authPatient, changePassword);

export default router;