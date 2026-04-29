/**
 * seedUsers.js
 *
 * Seeds 6 demo users (2 patients, 2 doctors, 1 hospital, 1 admin)
 * with bcrypt-hashed passwords into the `users` collection.
 *
 * Run:  node seedUsers.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const SALT_ROUNDS = 12;

const usersToSeed = [
  // ── Patients ──────────────────────────────────────────────────
  {
    name: 'Alice Johnson',
    email: 'alice.patient@docplus.com',
    password: 'Patient@123',
    role: 'patient',
  },
  {
    name: 'Bob Williams',
    email: 'bob.patient@docplus.com',
    password: 'Patient@456',
    role: 'patient',
  },
  // ── Doctors ───────────────────────────────────────────────────
  {
    name: 'Dr. Sarah Khan',
    email: 'sarah.doctor@docplus.com',
    password: 'Doctor@123',
    role: 'doctor',
  },
  {
    name: 'Dr. James Lee',
    email: 'james.doctor@docplus.com',
    password: 'Doctor@456',
    role: 'doctor',
  },
  // ── Hospital ──────────────────────────────────────────────────
  {
    name: 'City General Hospital',
    email: 'cityhospital@docplus.com',
    password: 'Hospital@123',
    role: 'hospital',
  },
  // ── Admin ─────────────────────────────────────────────────────
  {
    name: 'Admin User',
    email: 'admin@docplus.com',
    password: 'Admin@2024!',
    role: 'admin',
  },
];

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO;
    if (!mongoUri) throw new Error('MONGO env variable not set in .env');

    await mongoose.connect(mongoUri);
    console.log('✅  Connected to MongoDB');

    // Remove existing seeded users (by email) so the script is idempotent
    const emails = usersToSeed.map((u) => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log('🗑️   Cleared previous seed users');

    // Hash passwords and insert
    const hashed = await Promise.all(
      usersToSeed.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, SALT_ROUNDS),
      }))
    );

    await User.insertMany(hashed);

    console.log('\n🎉  Seeded users successfully!\n');
    console.log('─'.repeat(68));
    console.log(
      'Role'.padEnd(12) + 'Email'.padEnd(34) + 'Password'
    );
    console.log('─'.repeat(68));
    usersToSeed.forEach((u) => {
      console.log(
        u.role.padEnd(12) + u.email.padEnd(34) + u.password
      );
    });
    console.log('─'.repeat(68));

    process.exit(0);
  } catch (err) {
    console.error('❌  Seeding failed:', err.message);
    process.exit(1);
  }
};

seedUsers();
