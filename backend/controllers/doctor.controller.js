import Doctor from '../models/doctor.model.js';
import { registerDoctorSchema } from '../zodTypes.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerDoctor = async (req, res) => {
  try {
    const result = registerDoctorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.errors,
      });
    }
    const validatedData = result.data;

    const existingDoctor = await Doctor.findOne({ email: validatedData.email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    validatedData.password = hashedPassword;

    const doctor = new Doctor(validatedData);
    await doctor.save();

    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      token,
      doctor,
    });
  } catch (error) {
    console.error('Error in registerDoctor:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    doctor.password = undefined;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      doctor,
    });
  } catch (error) {
    console.error('Error in loginDoctor:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const updateData = req.body;

    if (updateData.password) delete updateData.password;

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, { new: true });
    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error('Error in updateDoctorProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const changeDoctorPassword = async (req, res) => {
  try {
    const doctorId = req.doctor._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    doctor.password = hashedNewPassword;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error in changeDoctorPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
