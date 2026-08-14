import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../middleware/auth.js';
import { isProd } from '../config/env.js';

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw ApiError.conflict('An account with that email already exists');

  // role is deliberately not taken from the request body.
  const user = await User.create({ ...req.body, role: 'customer' });
  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({ success: true, token, user: user.toPublic() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been disabled');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({ success: true, token, user: user.toPublic() });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Signed out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublic() });
});

export const updateMe = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ success: true, user: req.user.toPublic() });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw ApiError.badRequest('Your current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ success: true, token, message: 'Password updated' });
});
