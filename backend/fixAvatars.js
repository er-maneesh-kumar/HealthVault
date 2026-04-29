/**
 * fixAvatars.js
 *
 * Replaces every empty / broken avatar in the patients, doctors,
 * and hospitals collections with a generated UI-Avatars URL.
 *
 * Run:  node fixAvatars.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Patient from './models/patient.model.js';
import Doctor  from './models/doctor.model.js';
import Hospital from './models/hospital.model.js';

dotenv.config();

const uiAvatar = (name, bg = 'random') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=256&bold=true`;

const isBroken = (url) =>
  !url ||
  url.trim() === '' ||
  url === 'undefined' ||
  url === 'null';

async function fixCollection(Model, nameField, label) {
  const docs = await Model.find({});
  let fixed = 0;

  for (const doc of docs) {
    if (isBroken(doc.avatar)) {
      const name = doc[nameField] || label;
      doc.avatar = uiAvatar(name);
      await doc.save();
      fixed++;
      console.log(`  ✔  ${label}: "${name}" → avatar updated`);
    }
  }

  console.log(`  → ${fixed} of ${docs.length} ${label} records updated.\n`);
}

async function run() {
  const uri = process.env.MONGO;
  if (!uri) throw new Error('MONGO not set in .env');

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB\n');

  console.log('📋  Fixing Patients…');
  await fixCollection(Patient, 'p_name', 'Patient');

  console.log('📋  Fixing Doctors…');
  await fixCollection(Doctor, 'd_name', 'Doctor');

  console.log('📋  Fixing Hospitals…');
  await fixCollection(Hospital, 'h_name', 'Hospital');

  console.log('🎉  All avatars fixed!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
