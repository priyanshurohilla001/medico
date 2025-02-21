import jwt from 'jsonwebtoken';
import Patient from '../models/patient.model.js';

const authPatient = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied, token missing",
        });
    }

    let verified;
    try {
        verified = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    try {
        const patient = await Patient.findById(verified.id);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        req.patient = patient;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error in authentication middleware",
        });
    }
};

export default authPatient;
