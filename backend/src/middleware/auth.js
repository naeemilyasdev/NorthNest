import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

let User;
try {
  User = (await import('../../models/User.js')).default;
} catch (error) {
  User = null;
}

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (User) {
      const user = await User.findById(decoded.id).select('-password').lean();
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
    } else {
      req.user = { id: decoded.id, role: decoded.role || 'user' };
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};