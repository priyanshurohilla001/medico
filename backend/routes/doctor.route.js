import express from 'express';
import { registerDoctor, loginDoctor, updateDoctorProfile, changeDoctorPassword, searchDoctors, getDoctorById, getDoctorUpcomingAppointments, checkPatientAccess, requestPatientAccess, getPatientRecords } from '../controllers/doctor.controller.js';
import authDoctor from '../services/authDoctor.js';

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.patch('/profile', authDoctor, updateDoctorProfile);
router.patch('/change-password', authDoctor, changeDoctorPassword);
router.get('/profile', authDoctor, (req, res) => {
  res.send(req.doctor);
});
router.get('/search', searchDoctors); 
router.get('/:id/appointments', getDoctorUpcomingAppointments);
router.get('/:id', getDoctorById);

router.get('/check-access/:patientId', authDoctor, checkPatientAccess);
router.post('/request-access', authDoctor, requestPatientAccess);
router.get('/patient-records/:patientId', authDoctor, getPatientRecords);

export default router;
