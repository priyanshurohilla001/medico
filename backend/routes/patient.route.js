import express from 'express';
import { 
  registerPatient,
  loginPatient,
  getPatientProfile,
  updatePatientProfile,
  changePassword,
  getPatientLabRecords,
  getDoctorAccessRequests,
  updateDoctorAccess,
  getMyAppointments,
  getAppointmentDetails
} from '../controllers/patient.controller.js';
import authPatient from '../services/authPatient.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.get('/profile', authPatient, getPatientProfile);
router.put('/profile', authPatient, updatePatientProfile);
router.put('/change-password', authPatient, changePassword);
router.get('/lab-records', authPatient, getPatientLabRecords);
router.get('/access-requests', authPatient, getDoctorAccessRequests);
router.put('/update-access', authPatient, updateDoctorAccess);
router.get('/my-appointments', authPatient, getMyAppointments);
router.get('/my-appointments/:appointmentId', authPatient, getAppointmentDetails);

export default router;