import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  specialties: {
    type: [String],
    required: true,
  },
  qualifications: {
    type: String,
  },
  experience: {
    type: Number,
  },
  age: {
    type: Number,
  },
  consultationFees: {
    online: {
      type: Number,
      required: true,
    },
    physical: {
      type: Number,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Doctor', doctorSchema);
