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


export const scheduleSchema = z
  .object({
    workingStartTimestamp: z
      .number({ required_error: 'Working start time is required' })
      .int()
      .nonnegative(),
    workingEndTimestamp: z
      .number({ required_error: 'Working end time is required' })
      .int()
      .nonnegative(),
    numberOfAppointments: z
      .number({ required_error: 'Number of appointments is required' })
      .int()
      .positive({ message: 'Number of appointments must be a positive integer' }),
    averageAppointmentTime: z
      .number({ required_error: 'Average appointment time is required' })
      .int()
      .positive({ message: 'Average appointment time must be a positive integer' }),
    onlineConsultationPrice: z
      .number({ required_error: 'Online consultation price is required' })
      .nonnegative({ message: 'Online consultation price must be nonnegative' }),
    physicalConsultationPrice: z
      .number({ required_error: 'Physical consultation price is required' })
      .nonnegative({ message: 'Physical consultation price must be nonnegative' }),
    startDate: z
      .number({ required_error: 'Start date is required' })
      .int()
      .nonnegative(),
    endDate: z
      .number({ required_error: 'End date is required' })
      .int()
      .nonnegative(),
  })
  .refine(
    (data) => data.workingStartTimestamp < data.workingEndTimestamp,
    {
      message: 'Working start time must be before working end time',
      path: ['workingStartTimestamp', 'workingEndTimestamp'],
    }
  )
  .refine(
    (data) => data.startDate <= data.endDate,
    {
      message: 'Start date must be less than or equal to end date',
      path: ['startDate', 'endDate'],
    }
  );
