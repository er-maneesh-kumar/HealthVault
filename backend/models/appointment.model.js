import mongoose from 'mongoose';

const { Schema } = mongoose;

const appointmentSchema = new Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  }
}, { collection: 'appointments', timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
