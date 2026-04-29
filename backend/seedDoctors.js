import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';

dotenv.config();

const sampleDoctors = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    gender: 'Female',
    age: 42,
    qualifications: 'MBBS, MD - Cardiology',
    specialization: 'Cardiologist',
    hospital: 'Apollo Hospitals',
    phone: '+1 234 567 8901',
    bio: 'Experienced cardiologist with 15 years of experience in treating heart conditions.',
    avatarName: 'Sarah+Jenkins',
    color: '2AA7FF'
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    gender: 'Male',
    age: 38,
    qualifications: 'MBBS, MS - Orthopaedics',
    specialization: 'Orthopaedic Surgeon',
    hospital: 'Fortis Healthcare',
    phone: '+1 234 567 8902',
    bio: 'Specialist in joint replacement and sports injuries.',
    avatarName: 'Michael+Chen',
    color: '10B981'
  },
  {
    name: 'Dr. Emily Watson',
    email: 'emily.watson@example.com',
    gender: 'Female',
    age: 35,
    qualifications: 'MBBS, MD - Dermatology',
    specialization: 'Dermatologist',
    hospital: 'Max Super Speciality',
    phone: '+1 234 567 8903',
    bio: 'Expert in medical and cosmetic dermatology.',
    avatarName: 'Emily+Watson',
    color: '7C3AED'
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    gender: 'Male',
    age: 50,
    qualifications: 'MBBS, MD - General Medicine',
    specialization: 'General Physician',
    hospital: 'City Care Hospital',
    phone: '+1 234 567 8904',
    bio: 'Primary care physician focusing on preventive care and chronic disease management.',
    avatarName: 'James+Wilson',
    color: 'F59E0B'
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('Clearing existing sample doctors...');

    // Optionally clear existing sample doctors based on email domain
    const emails = sampleDoctors.map(d => d.email);
    const existingUsers = await User.find({ email: { $in: emails } });
    const existingUserIds = existingUsers.map(u => u._id.toString());
    
    if (existingUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: existingUserIds } });
      await Doctor.deleteMany({ firebaseUid: { $in: existingUserIds } });
    }

    console.log('Seeding new doctors...');

    for (const doc of sampleDoctors) {
      // 1. Create User
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: hashedPassword,
        role: 'doctor',
      });

      // 2. Create Doctor Profile
      const avatarUrl = `https://ui-avatars.com/api/?name=${doc.avatarName}&background=${doc.color}&color=fff&size=256&bold=true`;
      
      await Doctor.create({
        firebaseUid: user._id.toString(),
        d_id: user._id.toString(),
        d_name: doc.name,
        d_age: doc.age,
        d_qualifications: doc.qualifications,
        d_gender: doc.gender,
        d_specialization: doc.specialization,
        d_hospital: doc.hospital,
        email: doc.email,
        phone_number: doc.phone,
        bio: doc.bio,
        avatar: avatarUrl,
        educations: [
          { degree: 'MBBS', institution: 'Medical University', year: 2010 }
        ],
        work_experience: [
          { position: 'Consultant', hospital: doc.hospital, start_year: 2015, end_year: 'Present' }
        ]
      });

      console.log(`✅ Created doctor: ${doc.name}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
