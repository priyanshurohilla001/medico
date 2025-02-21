import { scheduleSchema } from "../zodTypes.js";

export async function createAppointment(req, res) {
  const result = scheduleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.errors,
    });
  }

  const {
    workingStartTimestamp,
    workingEndTimestamp,
    numberOfAppointments,
    averageAppointmentTime,
    onlineConsultationPrice,
    physicalConsultationPrice,
    startDate,
    endDate,
  } = result.data;

  console.log(
    workingStartTimestamp,
    workingEndTimestamp,
    numberOfAppointments,
    averageAppointmentTime,
    onlineConsultationPrice,
    physicalConsultationPrice,
    startDate,
    endDate
  );
  res.send("Create Appointment");
}
