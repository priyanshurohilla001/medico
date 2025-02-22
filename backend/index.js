import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from './db.js';
import doctorRoutes from './routes/doctor.route.js';
import patientRoutes from './routes/patient.route.js';
import appointmentRoutes from './routes/appointment.route.js';
import labAssistantRoutes from './routes/labAssistant.route.js';
dotenv.config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173','http://localhost:8000'], 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(express.json());

connectToDatabase();

app.get('/', (req, res) => {
  res.send('Welcome to the Doctor Booking API');
});

app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use("/api/labAssistant", labAssistantRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
