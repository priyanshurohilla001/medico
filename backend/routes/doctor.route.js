import express from 'express';
import { registerDoctor, loginDoctor, updateDoctorProfile, changeDoctorPassword } from '../controllers/doctor.controller.js';
import authDoctor from '../services/authDoctor.js';

const router = express.Router();


router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.patch('/profile', authDoctor, updateDoctorProfile);
router.patch('/change-password', authDoctor, changeDoctorPassword);
router.get('/profile', authDoctor, (req, res) => {
  res.send(req.doctor);
});

export default router;
