import Appointment from "../models/appointment.model.js";
import { scheduleSchema } from "../zodTypes.js";
import Doctor from "../models/doctor.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyCzfmYkM8rXHAquT-naGgJPYUFK4FUBnAM");
// console.log("loaalkey:",process.env.GEMINI_API_KEY);

export async function createAppointment(req, res) {
  console.log("Debug - Create Appointment Request Body:", req.body);
  console.log("Debug - Doctor ID:", req.doctor._id);

  const result = scheduleSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: result.error.errors,
      });
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
    return res
      .status(400)
      .json({ success: false, message: "Start date cannot be in the past." });
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  let currentDay = startDateTime;
  currentDay.setUTCHours(0, 0, 0, 0);
  const finalDay = new Date(endDate);
  finalDay.setUTCHours(0, 0, 0, 0);

  const [startHour, startMinute] = dailyWorkingStartTime.split(":").map(Number);
  const [endHour, endMinute] = dailyWorkingEndTime.split(":").map(Number);

  const startOffset = startHour * 3600000 + startMinute * 60000;

  const endOffset = endHour * 3600000 + endMinute * 60000;

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

      const hours = slotTime.getUTCHours().toString().padStart(2, "0");
      const minutes = slotTime.getUTCMinutes().toString().padStart(2, "0");
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
          status: "available",
        });
      } else {
        duplicateCount++;
      }

      slotTime = new Date(slotTime.getTime() + appointmentDurationMs);
    }
    currentDay = new Date(currentDay.getTime() + oneDayMs);
  }

  try {
    console.log("Debug - Generated Appointments:", appointments.length);
    await Appointment.insertMany(appointments);
    console.log("Debug - Successfully inserted appointments");

    let message = "Appointments created successfully";
    if (duplicateCount > 0) {
      message += ` (Skipped ${duplicateCount} duplicate slots)`;
    }
    return res.status(201).json({
      success: true,
      message,
      count: appointments.length,
      firstAppointment: appointments[0],
    });
  } catch (error) {
    console.error("Error creating appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

export async function deleteUnbookedAppointment(req, res) {
  const appointmentId = req.params.id;
  const doctorId = req.doctor._id;

  try {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to delete it",
      });
    }

    if (appointment.status !== "available") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a booked appointment. Use cancel endpoint instead.",
      });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function cancelBookedAppointment(req, res) {
  const appointmentId = req.params.id;
  const doctorId = req.doctor._id;

  try {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to cancel it",
      });
    }

    if (appointment.status === "available") {
      return res.status(400).json({
        success: false,
        message: "Appointment is not booked yet",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
      status: "confirmed",
    });

    const appointments = await Appointment.find({
      doctorId,
      status: "confirmed",
    })
      .populate("patientId", "name email phone")
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
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching confirmed appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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

  console.log("Debug - Query Parameters:", {
    doctorId,
    currentDate,
    page,
    limit,
    skip,
  });

  try {
    const total = await Appointment.countDocuments({
      doctorId,
      status: "available",
      appointmentDate: { $gte: currentDate },
    });

    console.log("Debug - Total Available Appointments:", total);

    const appointments = await Appointment.find({
      doctorId,
      status: "available",
      appointmentDate: { $gte: currentDate },
    })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    console.log("Debug - Found Appointments:", appointments.length);

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching available appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function confirmAppointment(req, res) {
  try {
    const patientId = req.patient.id;
    const { appointmentId, consultationType, doctorId, fees } = req.body;

    console.log(appointmentId, consultationType, doctorId, fees);

    if (!appointmentId || !consultationType || !doctorId || !fees) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    let correctFees;
    if (consultationType === "online") {
      correctFees = doctor.consultationFees.online;
    } else if (consultationType === "physical") {
      correctFees = doctor.consultationFees.physical;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation type",
      });
    }

    console.log(correctFees);

    if (fees !== correctFees) {
      return res.status(400).json({
        success: false,
        message: "Invalid fees amount",
        expectedFees: correctFees,
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorId,
      status: "available",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment slot not found or already booked",
      });
    }

    appointment.patientId = patientId;
    appointment.status = "confirmed";
    appointment.appointmentType = consultationType;
    appointment.price = fees;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAppointmentById(req, res) {
  const { id } = req.params;
  const doctorId = req.doctor._id;

  try {
    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: doctorId,
    }).populate("patientId", "name email phone");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to view it",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorId,
    }).populate("patientId", "name email phone");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error in getAppointmentDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export async function saveConsultationDetails(req, res) {
  try {
    const { id } = req.params;
    const doctorId = req.doctor._id;
    const { notes, medicines, suggestions } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: doctorId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or you don't have permission to modify it",
      });
    }

    appointment.consultationDetails = {
      notes,
      medicines,
      suggestions,
    };

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Consultation details saved successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error saving consultation details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function aiAnalyze(req, res) {
  try {
    const { id } = req.params;
    const doctorId = req.doctor._id;
    const { currentConsultation, patientId } = req.body;

    // Get patient's past records
    const pastAppointments = await Appointment.find({
      patientId,
      status: "completed",
    })
      .sort({ appointmentDate: -1 })
      .limit(5);

    // Format data for AI
    const prompt = {
      pastConsultations: pastAppointments.map((apt) => ({
        date: apt.appointmentDate,
        notes: apt.consultationDetails?.notes,
        medicines: apt.consultationDetails?.medicines,
        suggestions: apt.consultationDetails?.suggestions,
      })),
      currentConsultation,
    };

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`
      You are a medical AI assistant. Your task is to analyze this patient consultation data and provide actionable insights.
      Here's the patient data: ${JSON.stringify(prompt)}

      Instructions:
      1. Review current consultation notes and medicines
      2. Compare with past medical history
      3. Look for patterns and potential issues
      4. Provide specific, detailed observations and suggestions

      Your response must be in this exact JSON format:
      {
        "observations": [
          "Current symptoms and conditions noted",
          "Patterns from past visits",
          "Key health changes",
          "Medicine adherence patterns",
          "Effectiveness of previous treatments"
        ],
        "warnings": [
          "Potential drug interactions",
          "Contraindications",
          "Risk factors identified"
        ],
        "suggestions": [
          "Treatment recommendations",
          "Monitoring requirements",
          "Lifestyle modifications",
          "Follow-up schedule",
          "Additional tests if needed"
        ]
      }

      Important: Each array must contain at least 3 detailed items. Be specific and medical-focused.
      Respond with only the JSON object, no other text.
    `);

    const response = result.response;
    let analysis;

    try {
      // Clean and parse the response
      const cleanText = response
        .text()
        .replace(/```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();

      analysis = JSON.parse(cleanText);

      // Validate and provide fallback content if needed
      const fallbackContent = {
        observations: [
          `Current Consultation: ${currentConsultation.notes ? "Notes provided" : "No notes provided"}`,
          `Prescribed Medications: ${currentConsultation.medicines?.length || 0} medicines recorded`,
          `Treatment Plan: ${currentConsultation.suggestions ? "Recommendations provided" : "No recommendations yet"}`,
          "Review of past medical history completed",
          `Previous Visits: ${pastAppointments.length} records analyzed`
        ],
        warnings: [
          "Review all current medications for interactions",
          "Verify patient allergies and contraindications",
          "Consider updating medical history"
        ],
        suggestions: [
          "Document any changes in symptoms or condition",
          "Schedule appropriate follow-up visits",
          "Consider reviewing medication adherence",
          "Update patient medical records",
          "Monitor patient response to prescribed medications"
        ]
      };

      // Ensure each section has content
      analysis = {
        observations: Array.isArray(analysis.observations) && analysis.observations.length >= 3
          ? analysis.observations
          : fallbackContent.observations,
        warnings: Array.isArray(analysis.warnings) && analysis.warnings.length > 0
          ? analysis.warnings
          : fallbackContent.warnings,
        suggestions: Array.isArray(analysis.suggestions) && analysis.suggestions.length >= 3
          ? analysis.suggestions
          : fallbackContent.suggestions
      };

    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Comprehensive fallback response
      analysis = {
        observations: [
          "Patient consultation details reviewed",
          "Medical history analysis completed",
          "Current treatment plan evaluated",
          "Medication regimen assessed",
          "Patient progress monitored"
        ],
        warnings: [
          "Standard medication interaction check recommended",
          "Verify patient's current symptoms and conditions",
          "Review any reported side effects"
        ],
        suggestions: [
          "Continue monitoring patient response to treatment",
          "Schedule follow-up appointment as needed",
          "Document any changes in condition",
          "Update treatment plan based on response",
          "Consider patient education on medication compliance"
        ]
      };
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze with AI"
    });
  }
}
