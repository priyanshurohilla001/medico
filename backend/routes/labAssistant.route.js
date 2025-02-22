import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import LabRecord from "../models/labRecord.model.js";
const router = express.Router();
dotenv.config();

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

router.get("/requestedAppointments", (req, res) => {
  const requestedAppointments = LabRecord.find({ status: "requested" })
    .populate("patient")
    .populate("doctor")
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
    requestedAppointments,
  });
});

export default router;
