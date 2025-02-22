import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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

export default router;
