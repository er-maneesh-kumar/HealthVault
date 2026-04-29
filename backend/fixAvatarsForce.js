/**
 * fixAvatarsForce.js
 *
 * Force-replaces ALL avatars in patients, doctors, and hospitals
 * with fresh ui-avatars.com URLs, regardless of current value.
 *
 * Run:  node fixAvatarsForce.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Patient  from './models/patient.model.js';
import Doctor   from './models/doctor.model.js';
import Hospital from './models/hospital.model.js';

dotenv.config();

const uiAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0D8ABC&color=fff&size=256&bold=true`;

async function forceFixCollection(Model, nameField, label) {
  const docs = await Model.find({});
  let fixed = 0;

  for (const doc of docs) {
    const name = doc[nameField] || label;
    const newAvatar = uiAvatar(name);
    doc.avatar = newAvatar;
    await doc.save();
    fixed++;
    console.log(`  ✔  ${label}: "${name}"`);
  }

  console.log(`  → ${fixed} ${label} records updated.\n`);
}

async function run() {
  const uri = process.env.MONGO;
  if (!uri) throw new Error('MONGO not set in .env');

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB\n');

  console.log('📋  Updating Patients…');
  await forceFixCollection(Patient, 'p_name', 'Patient');

  console.log('📋  Updating Doctors…');
  await forceFixCollection(Doctor, 'd_name', 'Doctor');

  console.log('📋  Updating Hospitals…');
  await forceFixCollection(Hospital, 'h_name', 'Hospital');

  console.log('🎉  Done! All avatars replaced with ui-avatars URLs.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
