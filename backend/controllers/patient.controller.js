import jwt from 'jsonwebtoken';
import Patient from '../models/patient.model.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../zodTypes.js';
import Appointment from '../models/appointment.model.js';

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

export async function getDoctorAccessRequests(req, res) {
    try {
        const patient = await Patient.findById(req.patient.id)
            .populate('approvedDoctors.doctorId', 'name email specialties');
        
        return res.status(200).json({
            success: true,
            requests: patient.approvedDoctors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch access requests"
        });
    }
}

export async function updateDoctorAccess(req, res) {
    try {
        const { doctorId, approved } = req.body;
        
        const patient = await Patient.findById(req.patient.id);
        if (!approved) {
            // Remove the doctor completely from approvedDoctors array
            patient.approvedDoctors = patient.approvedDoctors.filter(
                doc => doc.doctorId.toString() !== doctorId
            );
        } else {
            const requestIndex = patient.approvedDoctors.findIndex(
                doc => doc.doctorId.toString() === doctorId
            );
            if (requestIndex !== -1) {
                patient.approvedDoctors[requestIndex].approvalStatus = true;
            }
        }
        
        await patient.save();

        return res.status(200).json({
            success: true,
            message: `Access ${approved ? 'granted' : 'revoked'}`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update access"
        });
    }
}

export async function getMyAppointments(req, res) {
    try {
        const appointments = await Appointment.find({ patientId: req.patient.id })
            .populate({
                path: 'doctorId',
                select: 'name email specialties consultationFees qualification experience'
            })
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        return res.status(200).json({
            success: true,
            appointments
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments"
        });
    }
}

export async function getAppointmentDetails(req, res) {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId)
            .populate({
                path: 'doctorId',
                select: 'name email specialties consultationFees qualification experience about education'
            })
            .populate('patientId', 'name email phone age gender');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.patientId._id.toString() !== req.patient.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access"
            });
        }

        return res.status(200).json({
            success: true,
            appointment
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointment details",
            error: error.message
        });
    }
}
