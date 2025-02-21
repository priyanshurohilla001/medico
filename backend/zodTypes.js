import { z } from 'zod';

export const registerDoctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialties: z.array(z.string()).nonempty(
    "Please select at least one specialty. Popular specialties in India include ENT, Cardiology, Orthopedics, Gynecology, Pediatrics, Dermatology, Neurology, Oncology, and Surgery."
  ),
  qualifications: z.string().optional(),
  experience: z.number().optional(),
  age: z.number().optional(),
});


export const scheduleSchema = z.object({
  dailyWorkingStartTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format for working start time. Must be HH:mm (e.g., 09:00, 17:30)",
  }),
  dailyWorkingEndTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format for working end time. Must be HH:mm (e.g., 09:00, 17:30)",
  }),
  numberOfAppointments: z.number().int().positive({
    message: "Number of appointments must be a positive integer.",
  }),
  averageAppointmentTime: z.number().positive({
    message: "Average appointment time must be a positive number (in minutes).",
  }),
  startDate: z.string().datetime({
    message: "Start date must be a valid date and time in ISO format.",
  }),
  endDate: z.string().datetime({
    message: "End date must be a valid date and time in ISO format.",
  }),
});