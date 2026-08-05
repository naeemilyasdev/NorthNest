import User from '../models/User.js';
import { HTTP_STATUS } from '../config/constants.js';
import { sendTokenResponse } from '../utils/jwtUtils.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  // Check if user already exists
  let user = await User.findOne({ email: normalizedEmail });
  if (user) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'User already exists',
    });
  }

  // Create user
  user = await User.create({
    name: `${firstName} ${lastName}`.trim(),
    firstName: String(firstName || '').trim(),
    lastName: String(lastName || '').trim(),
    email: normalizedEmail,
    password,
  });

  sendTokenResponse(user, HTTP_STATUS.CREATED, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  // Find user and select password
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  sendTokenResponse(user, HTTP_STATUS.OK, res);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: user.toJSON(),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      firstName,
      lastName,
      phone,
      address,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.toJSON(),
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
});
