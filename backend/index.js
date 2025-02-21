import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase } from './db.js';
import doctorRoutes from './routes/doctor.route.js';
import appointmentRoutes from './routes/appointment.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectToDatabase();

app.get('/', (req, res) => {
  res.send('Welcome to the Doctor Booking API');
});

app.use('/api/doctor',doctorRoutes );
app.use('/api/appointment',appointmentRoutes );

const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
