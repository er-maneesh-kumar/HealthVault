import mongoose from 'mongoose';

const { Schema } = mongoose;

const patientSchema = new Schema({
  firebaseUid: { type: String, required: false, default: '' }, // accepts MongoDB user _id
  p_id:        { type: String, required: true },
  p_name:      { type: String, required: true },
  p_age:       { type: Number, required: true },
  p_gender:    { type: String, required: true },
  p_bloodgroup:{ type: String, default: '' },
  p_address:   { type: String, required: true },
  avatar:      { type: String, default: '' },
  Allergies:   { type: String, required: true },
  Family_History: { type: String, required: true },
}, { collection: 'patients' });

export default mongoose.model('Patient', patientSchema);
