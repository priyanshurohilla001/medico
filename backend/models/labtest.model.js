import mongoose from 'mongoose';

// Define a schema for individual lab tests. This schema is meant to be embedded
// within a larger LabTestRequest model, allowing for multiple tests per request.
const labTestSchema = new mongoose.Schema({
    // Name of the test, e.g., "CBC" (Complete Blood Count)
    testName: {
      type: String,
      required: true, // Must be provided for every test entry
      trim: true,   // Removes any extra spaces from the input
    },
    result: {
      type: String,
      default: '',
      trim: true,
    },
    referenceRange: {
      type: String,
      default: '',
    },
    // Additional remarks or observations specific to the test.
    // This field can be used for notes like "slightly elevated" or "within normal limits".
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    // Timestamp capturing when the test was performed.
    // Useful for tracking historical test data.
    performedAt: {
      type: Date,
      default: Date.now,
    },
    // A flag to indicate if the test result is critical and may require urgent attention.
    isCritical: {
      type: Boolean,
      default: false,
    }
  }, { _id: false }); // _id set to false because this schema is intended to be a sub-document
  
  /* 
  Example: CBC Test Document
  
  This example demonstrates how you might store a CBC (Complete Blood Count)
  test result using the schema defined above.
  
  const exampleCBC = {
    testName: "CBC", // Name of the test
    result: "WBC: 6.2 x10^3/uL, RBC: 4.8 x10^6/uL, Hemoglobin: 15.1 g/dL, Hematocrit: 44%",
    referenceRange: "WBC: 4-11 x10^3/uL, RBC: 4.2-5.9 x10^6/uL, Hemoglobin: 13.5-17.5 g/dL, Hematocrit: 38-50%",
    remarks: "All values within normal limits.", // Additional observations
    performedAt: new Date(), // The date/time when the test was performed
    isCritical: false, // Indicates the test result is not critical
  };
  */
    

const labTestRequestSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  tests: {
    type: [labTestSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['requested', 'pending', 'completed'],
    default: 'requested',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  }
}, { timestamps: true });

export default mongoose.model('LabTestRequest', labTestRequestSchema);
