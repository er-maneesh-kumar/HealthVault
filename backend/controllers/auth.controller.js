import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'docplus_super_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

// ─── Register ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'patient',
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('[register] error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('[login] error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// ─── Get current user (protected) ────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('[getMe] error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body; // credential = Google ID token

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required.' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: 'Google Client ID not configured on server.' });
    }

    // Verify token with Google
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    const isNewUser = !user;

    if (!user) {
      // New user — create with provided role or default to 'patient'
      const allowedRoles = ['patient', 'doctor', 'hospital'];
      const assignedRole = allowedRoles.includes(role) ? role : 'patient';

      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: '', // No password for Google users
        role: assignedRole,
        googleId: payload.sub,
        avatar: picture || '',
      });
    }

    // Issue our own JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(isNewUser ? 201 : 200).json({
      message: isNewUser ? 'Account created successfully.' : 'Login successful.',
      token,
      isNewUser,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('[googleAuth] error:', error);
    return res.status(401).json({ message: 'Google authentication failed. Please try again.' });
  }
};

