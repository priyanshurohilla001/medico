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

export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, "Password is required")
});

export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .trim(),
  email: z.string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
  age: z.preprocess(val => Number(val), z.number()
    .min(0, "Age must be at least 0")
    .max(120, "Age must be 120 or less")),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender"
  }),
  address: z.string()
    .min(1, "Address is required")
    .trim()
});

export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    age: z.number().min(0, "Age must be a positive number").optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional()
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
});