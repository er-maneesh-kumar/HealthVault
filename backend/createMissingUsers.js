import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';

dotenv.config();

const createMissingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    const doctors = await Doctor.find({});
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    let createdCount = 0;

    for (const doc of doctors) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: doc.email });
      
      if (!existingUser) {
        // Create the missing user
        const newUser = await User.create({
          name: doc.d_name,
          email: doc.email,
          password: hashedPassword,
          role: 'doctor'
        });

        // Update the doctor's firebaseUid to match the new User ID so they link properly
        doc.firebaseUid = newUser._id.toString();
        await doc.save();
        
        console.log(`Created missing user for ${doc.d_name} (${doc.email})`);
        createdCount++;
      }
    }

    console.log(`Successfully created ${createdCount} missing user accounts!`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating missing users:', error);
    process.exit(1);
  }
};

createMissingUsers();
