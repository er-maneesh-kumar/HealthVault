import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Doctor from './models/doctor.model.js';
import Patient from './models/patient.model.js';
import PDInteraction from './models/pdinteraction.model.js';
import Hospital from './models/hospital.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO;
    if (!mongoUri) {
      throw new Error('MONGO environment variable is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await PDInteraction.deleteMany({});
    await Hospital.deleteMany({});
    console.log('Cleared existing data.');

    // Load and seed Doctors
    const doctorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'doctor.json'), 'utf-8'));
    const doctors = doctorsData.map((d, index) => ({
      ...d,
      firebaseUid: `seed-doctor-uid-${index}`,
      email: `doctor${index}@example.com`,
      phone_number: `123456789${index % 10}`,
      bio: `This is a seeded bio for ${d.d_name}.`,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.d_name)}&background=random`,
      educations: [{ degree: d.d_qualifications, institution: 'Medical University', year: 2010 }],
      work_experience: [{ position: d.d_specialization, hospital: d.d_hospital, start_year: 2015 }]
    }));
    await Doctor.insertMany(doctors);
    console.log(`Seeded ${doctors.length} Doctors.`);

    // Load and seed Patients
    const patientsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'patient.json'), 'utf-8'));
    const patients = patientsData.map((p, index) => ({
      ...p,
      firebaseUid: p.firebaseUid || `seed-patient-uid-${index}`,
      avatar: p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.p_name)}&background=random`,
      Allergies: p.Allergies || 'None',
      Family_History: p.Family_History || 'None'
    }));
    await Patient.insertMany(patients);
    console.log(`Seeded ${patients.length} Patients.`);

    // Load and seed PDInteractions
    const interactionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'pdInteraction.json'), 'utf-8'));
    await PDInteraction.insertMany(interactionsData);
    console.log(`Seeded ${interactionsData.length} PDInteractions.`);

    // Load and seed Hospitals
    const hospitalsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'hospital.json'), 'utf-8'));
    const hospitals = hospitalsData.map((h, index) => ({
      ...h,
      firebaseUid: `seed-hospital-uid-${index}`
    }));
    await Hospital.insertMany(hospitals);
    console.log(`Seeded ${hospitals.length} Hospitals.`);

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
