import jwt from 'jsonwebtoken';
import Doctor from '../models/doctor.model.js';

const authDoctor = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied, token missing",
    });
  }

  let verified;
  try {
    verified = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  try {
    const doctor = await Doctor.findById(verified.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware",
    });
  }
};

export default authDoctor;
