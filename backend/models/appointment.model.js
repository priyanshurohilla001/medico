import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "confirmed", "completed", "cancelled"],
      default: "available",
    },
    appointmentType: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },

    consultationDetails: {
      notes: { type: String },
      medicines: [
        {
          name: { type: String, required: true },
          dosage: { type: String }, // e.g., "500mg", "1 tablet"
          frequency: { type: String }, // e.g., "Twice a day"
          duration: { type: String }, // e.g., "5 days"
        },
      ],
      suggestions: { type: String }, // AI-generated suggestions
    },
  },
  {
    timestamps: true,
  }
);

// Add index for common queries
appointmentSchema.index({ doctorId: 1, status: 1, appointmentDate: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
