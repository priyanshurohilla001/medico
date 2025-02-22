import Doctor from '../models/doctor.model.js';
import { registerDoctorSchema } from '../zodTypes.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Appointment from '../models/appointment.model.js';
import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';

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

    // Validate and clean consultation fees
    if (updateData.consultationFees) {
      // Convert fees to numbers and ensure they are non-negative
      const online = Number(updateData.consultationFees.online);
      const physical = Number(updateData.consultationFees.physical);

      updateData.consultationFees = {
        online: isNaN(online) || online < 0 ? 0 : online,
        physical: isNaN(physical) || physical < 0 ? 0 : physical
      };
    }

    if (updateData.password) delete updateData.password;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      { 
        new: true,
        select: 'name email specialties qualifications experience age consultationFees createdAt'
      }
    );

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

    const doctor = await Doctor.findById(doctorId).select('+password');
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

export const searchDoctors = async (req, res) => {
  try {
    const { query, speciality } = req.query;
    let searchCriteria = {};

    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: "i" } },
        { specialties: { $regex: query, $options: "i" } }
      ];
    }

    if (speciality) {
      const specialtiesArray = speciality.split(",").filter(Boolean);
      if (specialtiesArray.length) {
        searchCriteria.specialties = { $in: specialtiesArray };
      }
    }

    // Make sure to include consultation fees in the response
    const doctors = await Doctor.find(searchCriteria)
      .select("-password")
      .select("name email specialties qualifications experience age consultationFees")
      .lean();

    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Error in searchDoctors:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Make sure to include consultation fees in the response
    const doctor = await Doctor.findById(id)
      .select('-password')
      .select('name email specialties qualifications experience age consultationFees createdAt')
      .lean();
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Add default values for consultation fees if not set
    if (!doctor.consultationFees) {
      doctor.consultationFees = { online: 0, physical: 0 };
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error('Error in getDoctorById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


export const getDoctorUpcomingAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctorId: id,
      appointmentDate: { $gte: today }
    })
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(50)
    .select('appointmentDate appointmentTime _id patientId')
    .lean();

    const dateSet = new Set();
    const orderedDates = [];
    
    for (const apt of appointments) {
      const dateStr = apt.appointmentDate.toISOString().split('T')[0];
      if (!dateSet.has(dateStr)) {
        dateSet.add(dateStr);
        orderedDates.push(dateStr);
        if (orderedDates.length >= 7) break;
      }
    }

    const result = [];
    for (const date of orderedDates) {
      result.push({
        date,
        appointments: appointments
          .filter(apt => 
            apt.appointmentDate.toISOString().startsWith(date)
          )
          .map(apt => ({
            time: apt.appointmentTime,
            appointmentId: apt._id,
            patientId: apt.patientId
          }))
      });
    }

    return res.status(200).json({
      success: true,
      appointments: result
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export async function checkPatientAccess(req, res) {
    try {
        const { patientId } = req.params;
        const doctorId = req.doctor._id;

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const hasAccess = patient.approvedDoctors.some(
            doc => doc.doctorId.toString() === doctorId.toString() && doc.approvalStatus
        );

        return res.status(200).json({
            success: true,
            hasAccess
        });
    } catch (error) {
        console.error('Error in checkPatientAccess:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to check access"
        });
    }
}

export const requestAccess = async (req, res) => {
    try {
        const { patientId } = req.body;
        
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required"
            });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check if request already exists
        const existingRequest = patient.approvedDoctors.find(
            doc => doc.doctorId.toString() === req.doctor.id
        );

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Access request already exists"
            });
        }

        // Add new request
        patient.approvedDoctors.push({
            doctorId: req.doctor.id,
            approvalStatus: false
        });

        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Access request sent successfully"
        });
    } catch (error) {
        console.error('Request access error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to send access request"
        });
    }
};

export async function getPatientRecords(req, res) {
    try {
        const { patientId } = req.params;
        const doctorId = req.doctor._id;

        // Check access first
        const patient = await Patient.findById(patientId)
            .populate({
                path: 'LabRecords',
                select: 'tests status requestedAt completedAt'
            });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const hasAccess = patient.approvedDoctors.some(
            doc => doc.doctorId.toString() === doctorId.toString() && doc.approvalStatus
        );

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Get both appointments and lab records
        const [appointments, labRecords] = await Promise.all([
            // Get completed appointments
            Appointment.find({ 
                patientId,
                status: 'completed',
                consultationDetails: { $exists: true, $ne: null }
            })
            .sort({ appointmentDate: -1 })
            .populate('doctorId', 'name')
            .select('appointmentDate consultationDetails doctorId'),

            // Get lab records
            patient.LabRecords
        ]);

        // Combine and format the records
        const records = {
            appointments: appointments.map(apt => ({
                date: apt.appointmentDate,
                type: 'appointment',
                doctorName: apt.doctorId.name,
                diagnosis: apt.consultationDetails.notes,
                prescriptions: apt.consultationDetails.medicines,
                suggestions: apt.consultationDetails.suggestions
            })),
            labRecords: labRecords.map(record => ({
                date: record.requestedAt,
                type: 'lab',
                status: record.status,
                tests: record.tests,
                completedAt: record.completedAt
            }))
        };

        return res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Error fetching patient records:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch records"
        });
    }
}