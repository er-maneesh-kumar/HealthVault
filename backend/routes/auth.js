import express from 'express';
import { register, login, getMe, googleAuth } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);    // Google OAuth

// Protected route – requires valid JWT
router.get('/me', verifyToken, getMe);

export default router;