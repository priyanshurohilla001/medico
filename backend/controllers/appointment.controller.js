import Appointment from '../models/appointment.model.js';
import { scheduleSchema } from "../zodTypes.js";
import Doctor from '../models/doctor.model.js';

export async function createAppointment(req, res) {
  console.log('Debug - Create Appointment Request Body:', req.body);
  console.log('Debug - Doctor ID:', req.doctor._id);

  const result = scheduleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: result.error.errors });
  }

  const {
    dailyWorkingStartTime,
    dailyWorkingEndTime,
    numberOfAppointments,
    averageAppointmentTime,
    startDate,
    endDate,
  } = result.data;

  const doctorId = req.doctor._id;

  const currentDate = new Date();
  const startDateTime = new Date(startDate);

  if (startDateTime < currentDate) {
    return res.status(400).json({ success: false, message: "Start date cannot be in the past." });
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  let currentDay = startDateTime;
  currentDay.setUTCHours(0, 0, 0, 0);
  const finalDay = new Date(endDate);
  finalDay.setUTCHours(0, 0, 0, 0);

  const [startHour, startMinute] = dailyWorkingStartTime.split(':').map(Number);
  const [endHour, endMinute] = dailyWorkingEndTime.split(':').map(Number);

  const startOffset =
    startHour * 3600000 +
    startMinute * 60000;

  const endOffset =
    endHour * 3600000 +
    endMinute * 60000;

  const workingDuration = endOffset - startOffset;
  const appointmentDurationMs = averageAppointmentTime * 60 * 1000;

  const slotsPerDay = Math.min(
    numberOfAppointments,
    Math.floor(workingDuration / appointmentDurationMs)
  );

  const appointments = [];
  let duplicateCount = 0;

  while (currentDay <= finalDay) {
    let slotTime = new Date(currentDay.getTime() + startOffset);

    for (let i = 0; i < slotsPerDay; i++) {
      if (slotTime.getTime() > currentDay.getTime() + endOffset) break;

      const hours = slotTime.getUTCHours().toString().padStart(2, '0');
      const minutes = slotTime.getUTCMinutes().toString().padStart(2, '0');
      const appointmentTime = `${hours}:${minutes}`;
      const appointmentDate = new Date(currentDay);

      
      const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate,
        appointmentTime,
      });

      if (!existingAppointment) {
        appointments.push({
          doctorId,
          appointmentDate,
          appointmentTime,
          appointmentType: null,
          price: null,
          status: 'available',
        });
      } else {
        duplicateCount++; 
      }

      slotTime = new Date(slotTime.getTime() + appointmentDurationMs);
    }
    currentDay = new Date(currentDay.getTime() + oneDayMs);
  }

  try {
    console.log('Debug - Generated Appointments:', appointments.length);
    await Appointment.insertMany(appointments);
    console.log('Debug - Successfully inserted appointments');
    
    let message = 'Appointments created successfully'; 
    if (duplicateCount > 0) {
      message += ` (Skipped ${duplicateCount} duplicate slots)`; 
    }
    return res.status(201).json({ 
      success: true, 
      message,
      count: appointments.length,
      firstAppointment: appointments[0]
    });
  } catch (error) {
    console.error('Error creating appointments:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
}

export async function deleteUnbookedAppointment(req, res) {
    const appointmentId = req.params.id;
    const doctorId = req.doctor._id;

    try {
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: doctorId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found or you don't have permission to delete it"
            });
        }

        if (appointment.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a booked appointment. Use cancel endpoint instead."
            });
        }

        await Appointment.findByIdAndDelete(appointmentId);

        return res.status(200).json({
            success: true,
            message: "Appointment deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function cancelBookedAppointment(req, res) {
    const appointmentId = req.params.id;
    const doctorId = req.doctor._id;

    try {
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: doctorId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found or you don't have permission to cancel it"
            });
        }

        if (appointment.status === 'available') {
            return res.status(400).json({
                success: false,
                message: "Appointment is not booked yet"
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully"
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function getConfirmedAppointments(req, res) {
    const doctorId = req.doctor._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    try {
        const total = await Appointment.countDocuments({
            doctorId,
            status: 'confirmed'
        });

        const appointments = await Appointment.find({
            doctorId,
            status: 'confirmed'
        })
        .populate('patientId', 'name email phone')
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(limit);

        return res.status(200).json({
            success: true,
            data: appointments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching confirmed appointments:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function getAvailableAppointments(req, res) {
    const doctorId = req.doctor._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    console.log('Debug - Query Parameters:', {
        doctorId,
        currentDate,
        page,
        limit,
        skip
    });

    try {
        const total = await Appointment.countDocuments({
            doctorId,
            status: 'available',
            appointmentDate: { $gte: currentDate }
        });

        console.log('Debug - Total Available Appointments:', total);

        const appointments = await Appointment.find({
            doctorId,
            status: 'available',
            appointmentDate: { $gte: currentDate }
        })
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(limit);

        console.log('Debug - Found Appointments:', appointments.length);

        return res.status(200).json({
            success: true,
            data: appointments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching available appointments:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


export async function confirmAppointment(req, res) {
    try {
        const patientId = req.patient.id;
        const { appointmentId, consultationType, doctorId, fees } = req.body;

        console.log(appointmentId, consultationType, doctorId, fees)

        if (!appointmentId || !consultationType || !doctorId || !fees) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        let correctFees;
        if (consultationType === 'online') {
            correctFees = doctor.consultationFees.online;
        } else if (consultationType === 'physical') {
            correctFees = doctor.consultationFees.physical;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid consultation type"
            });
        }

        console.log(correctFees)

        if (fees !== correctFees) {
            return res.status(400).json({
                success: false,
                message: "Invalid fees amount",
                expectedFees: correctFees
            });
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: doctorId,
            status: 'available'
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment slot not found or already booked"
            });
        }

        appointment.patientId = patientId;
        appointment.status = 'confirmed';
        appointment.appointmentType = consultationType;
        appointment.price = fees;

        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment confirmed successfully",
            data: appointment
        });

    } catch (error) {
        console.error('Error confirming appointment:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function getAppointmentById(req, res) {
    const { id } = req.params;
    const doctorId = req.doctor._id;

    try {
        const appointment = await Appointment.findOne({
            _id: id,
            doctorId: doctorId
        }).populate('patientId', 'name email phone');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found or you don't have permission to view it"
            });
        }

        return res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}