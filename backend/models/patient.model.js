import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minLength: [2, "Name must be at least 2 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [0, "Age cannot be negative"],
        max: [120, "Age cannot be more than 120"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        minLength: [10, "Phone number must be at least 10 characters"]
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: ['male', 'female', 'other']
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    LabRecords : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LabRecord'
        }
    ]
}, {
    timestamps: true
});

// Hash password before saving
patientSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
patientSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
