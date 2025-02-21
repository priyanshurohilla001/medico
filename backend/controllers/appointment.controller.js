// main_file.js
import Appointment from '../models/appointment.model.js';
import { scheduleSchema } from "../zodTypes.js";

export async function createAppointment(req, res) {
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
  let duplicateCount = 0; // To track how many duplicates are skipped

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
    await Appointment.insertMany(appointments);
    let message = 'Appointments created successfully'; 
    if (duplicateCount > 0) {
      message += ` (Skipped ${duplicateCount} duplicate slots)`; 
    }
    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error creating appointments:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}