import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: '' },        // empty string for Google-only accounts
    role: {
      type: String,
      enum: ['patient', 'doctor', 'hospital', 'admin'],
      default: 'patient',
    },
    googleId: { type: String, default: null },       // Google sub claim
    avatar:   { type: String, default: '' },          // Google profile picture
  },
  { collection: 'users', timestamps: true }
);

export default mongoose.model('User', userSchema);
