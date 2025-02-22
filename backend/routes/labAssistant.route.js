import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import LabRecord from "../models/labRecord.model.js";
import mongoose from "mongoose";
const router = express.Router();
dotenv.config();

// Validation middleware
const validateLabRequest = (req, res, next) => {
  try {
    const { appointmentId, doctorId, patientId, tests } = req.body;

    // Basic presence checks
    if (!appointmentId || !doctorId || !patientId || !tests) {
      return res.status(400).json({
        success: false,
        message: "All fields (appointmentId, doctorId, patientId, tests) are required"
      });
    }

    // ObjectId validations
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    
    if (!isValidObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointmentId format" });
    }
    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Invalid doctorId format" });
    }
    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ success: false, message: "Invalid patientId format" });
    }

    // Tests array validation
    if (!Array.isArray(tests)) {
      return res.status(400).json({ success: false, message: "Tests must be an array" });
    }
    if (tests.length === 0) {
      return res.status(400).json({ success: false, message: "At least one test is required" });
    }

    // Validate each test object
    for (const test of tests) {
      if (typeof test !== 'object') {
        return res.status(400).json({ success: false, message: "Each test must be an object" });
      }
      if (!test.testName || typeof test.testName !== 'string') {
        return res.status(400).json({ success: false, message: "Each test must have a valid testName string" });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Validation error",
      error: error.message
    });
  }
};

// Validation middleware for test results
const validateTestResults = (req, res, next) => {
  try {
    const { recordId, testResults } = req.body;

    if (!recordId || !mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({
        success: false,
        message: "Valid record ID is required"
      });
    }

    if (!Array.isArray(testResults)) {
      return res.status(400).json({
        success: false,
        message: "Test results must be an array"
      });
    }

    for (const test of testResults) {
      if (!test.result || !test.referenceRange || !test.testName) {
        return res.status(400).json({
          success: false,
          message: "Each test must have result, referenceRange, and testName"
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Validation error",
      error: error.message
    });
  }
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (
    email === process.env.LAB_ASSISTANT_EMAIL &&
    password === process.env.LAB_ASSISTANT_PASSWORD
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return res.json({ success: true, message: "Login successful", token });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const total = await LabRecord.countDocuments();
    const pending = await LabRecord.countDocuments({ status: "requested" });
    const completed = await LabRecord.countDocuments({ status: "completed" });

    return res.json({
      success: true,
      stats: {
        total,
        pending,
        completed
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
});

router.get("/requestedAppointments", async (req, res) => {
  try {
    const requestedAppointments = await LabRecord.find({ status: "requested" })
      .populate({
        path: "patientId",
        select: "name email" 
      })
      .populate({
        path: "doctorId",
        select: "name email"
      })
      .populate("appointmentId")
      .sort({ requestedAt: -1 })
      .exec();

    if (!requestedAppointments) {
      return res.status(404).json({
        success: false,
        message: "No requested appointments found",
      });
    }
    
    return res.json({
      success: true,
      message: "Requested appointments found",
      requestedAppointments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
});

router.post("/createTestRecord", validateLabRequest, async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, tests } = req.body;

    // Check for existing record
    const existingRecord = await LabRecord.findOne({ appointmentId });
    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: "Lab record already exists for this appointment"
      });
    }

    // Create new record
    const newLabRecord = new LabRecord({
      appointmentId,
      doctorId,
      patientId,
      tests: tests.map(test => ({
        testName: test.testName,
        result: "",
        referenceRange: "",
        remarks: "",
        performedAt: null,
        isCritical: false
      }))
    });

    await newLabRecord.save();

    // Populate and return
    const populatedRecord = await LabRecord.findById(newLabRecord._id)
      .populate("doctorId", "name email")
      .populate("patientId", "name email")
      .populate("appointmentId");

    return res.status(201).json({
      success: true,
      message: "Lab record created successfully",
      record: populatedRecord
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating lab record",
      error: error.message
    });
  }
});

// Add new route for updating test results
router.post("/updateTestResults", validateTestResults, async (req, res) => {
  try {
    const { recordId, testResults } = req.body;

    const labRecord = await LabRecord.findById(recordId);
    if (!labRecord) {
      return res.status(404).json({
        success: false,
        message: "Lab record not found"
      });
    }

    // Update each test with new results
    labRecord.tests = labRecord.tests.map(test => {
      const updatedTest = testResults.find(t => t.testName === test.testName);
      if (updatedTest) {
        return {
          ...test,
          result: updatedTest.result,
          referenceRange: updatedTest.referenceRange,
          remarks: updatedTest.remarks || '',
          performedAt: new Date(),
          isCritical: updatedTest.isCritical || false
        };
      }
      return test;
    });

    labRecord.status = 'completed';
    labRecord.completedAt = new Date();

    await labRecord.save();

    const populatedRecord = await LabRecord.findById(recordId)
      .populate("doctorId", "name email")
      .populate("patientId", "name email")
      .populate("appointmentId");

    return res.json({
      success: true,
      message: "Test results updated successfully",
      record: populatedRecord
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating test results",
      error: error.message
    });
  }
});

export default router;
