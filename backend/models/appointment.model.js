import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        default: null
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'confirmed', 'cancelled'],
        default: 'available'
    },
    appointmentType: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

// Add index for common queries
appointmentSchema.index({ doctorId: 1, status: 1, appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
