import jwt from 'jsonwebtoken';
import Patient from '../models/patient.model.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../zodTypes.js';

export async function registerPatient(req, res) {
    try {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.errors
            });
        }

        const existingPatient = await Patient.findOne({ email: result.data.email });
        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const patient = new Patient(result.data);
        await patient.save();

        const token = jwt.sign(
            { id: patient._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            success: true,
            token,
            message : "Patient registered successfully",
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
}

export async function loginPatient(req, res) {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.errors
            });
        }

        const patient = await Patient.findOne({ email: result.data.email }).select('+password');
        if (!patient) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await patient.comparePassword(result.data.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: patient._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message : "Login successful",
            token,
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
}

export async function getPatientProfile(req, res) {
    try {
        if (!req.patient || !req.patient.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const patient = await Patient.findById(req.patient.id)
            .select('-password -__v');  // Exclude sensitive fields

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message
        });
    }
}

export async function updatePatientProfile(req, res) {
    try {
        const result = updateProfileSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.errors
            });
        }

        const updatedPatient = await Patient.findByIdAndUpdate(
            req.patient.id,
            { $set: result.data },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            data: updatedPatient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
}

export async function changePassword(req, res) {
    try {
        const result = changePasswordSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.errors
            });
        }

        const patient = await Patient.findById(req.patient.id);
        const isMatch = await patient.comparePassword(result.data.currentPassword);
        
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        patient.password = result.data.newPassword;
        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to change password"
        });
    }
}

export async function getPatientLabRecords(req, res) {
    try {
        const patientId = req.patient.id;
        
        const labRecords = await Patient.findById(patientId)
            .populate({
                path: 'LabRecords',
                populate: [
                    {
                        path: 'doctorId',
                        select: 'name email'
                    },
                    {
                        path: 'appointmentId'
                    }
                ],
                options: { sort: { 'createdAt': -1 } }
            });

        return res.status(200).json({
            success: true,
            data: labRecords.LabRecords
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lab records",
            error: error.message
        });
    }
}
