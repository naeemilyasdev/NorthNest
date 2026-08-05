import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';

import { env } from '../src/config/env.js';
import validate from '../src/middleware/validate.js';
import { protect } from '../src/middleware/auth.js';

const router = express.Router();

let User;
try {
  User = (await import('../models/User.js')).default;
} catch (error) {
  User = null;
}

const signToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!User) {
        return res.status(500).json({ success: false, message: 'User model is not configured' });
      }

      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });

      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user'
      });

      const token = signToken({ id: user._id, role: user.role });

      res.status(201).json({
        success: true,
        token,
        user: serializeUser(user)
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      if (!User) {
        return res.status(500).json({ success: false, message: 'User model is not configured' });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = signToken({ id: user._id, role: user.role });

      res.json({
        success: true,
        token,
        user: serializeUser(user)
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;