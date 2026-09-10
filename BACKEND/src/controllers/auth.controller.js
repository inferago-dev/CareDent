import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../middleware/auth.js';
import { env, isProd } from '../config/env.js';
import { issueToken, redeemToken, generateOtp, generateToken } from '../models/AuthToken.js';
import { sendMail, passwordResetEmail, signInCodeEmail } from '../utils/mailer.js';

// A cookie is only replaced or removed by a Set-Cookie carrying the same
// name, path, domain, secure and sameSite. Clearing it with anything less
// leaves the original in place, so sign-out has to mirror sign-in exactly.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

export function setAuthCookie(res, token) {
  res.cookie('token', token, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearAuthCookie(res) {
  res.clearCookie('token', COOKIE_OPTIONS);
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
  clearAuthCookie(res);
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

/* ------------------------------------------------------------------ *
 * Password reset
 * ------------------------------------------------------------------ */

const RESET_TTL_MINUTES = 30;

/**
 * The same answer whether or not the address is registered.
 *
 * "No account with that email" turns this endpoint into a membership oracle:
 * anyone can check which of their competitors' addresses hold a Care Dent
 * account, and a leaked customer list is worth more than the reset flow it
 * came from. The customer who really does own the address gets the email;
 * everyone else gets the identical sentence and no mail.
 */
const RESET_REQUESTED = 'If that email has an account, a reset link is on its way.';

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user?.isActive) {
    const token = generateToken();
    await issueToken(user, 'password-reset', token, RESET_TTL_MINUTES * 60 * 1000);

    // CLIENT_URL may list several allowed origins; the first is the canonical
    // site, and a reset link has to point somewhere specific.
    const site = env.clientUrl.split(',')[0].trim().replace(/\/+$/, '');
    await sendMail({
      to: user.email,
      subject: 'Reset your Care Dent password',
      html: passwordResetEmail({
        name: user.name,
        url: `${site}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`,
        minutes: RESET_TTL_MINUTES,
      }),
    });
  }

  res.json({ success: true, message: RESET_REQUESTED });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isActive) throw ApiError.badRequest('That reset link is no longer valid.');

  const outcome = await redeemToken(user, 'password-reset', token);
  if (outcome !== 'ok') {
    throw ApiError.badRequest('That reset link is no longer valid. Request a new one.');
  }

  user.password = password;
  await user.save();

  // Signing them straight in is the point of the flow - they have just proved
  // control of the mailbox, and asking them to type the new password again
  // sends people back to "forgot password".
  const authToken = signToken(user);
  setAuthCookie(res, authToken);
  res.json({ success: true, token: authToken, user: user.toPublic(), message: 'Password updated' });
});

/* ------------------------------------------------------------------ *
 * Email sign-in code
 * ------------------------------------------------------------------ */

const OTP_TTL_MINUTES = 10;

/**
 * Codes sign in an existing account; they do not create one.
 *
 * Registration stays deliberate - name, clinic, password - because an endpoint
 * that mints an account for any address someone types is an endpoint that
 * mails strangers on request.
 */
const OTP_REQUESTED = 'If that email has an account, a sign-in code is on its way.';

export const requestOtp = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user?.isActive) {
    const code = generateOtp();
    await issueToken(user, 'otp', code, OTP_TTL_MINUTES * 60 * 1000);
    await sendMail({
      to: user.email,
      subject: `${code} is your Care Dent sign-in code`,
      html: signInCodeEmail({ name: user.name, code, minutes: OTP_TTL_MINUTES }),
    });
  }

  res.json({ success: true, message: OTP_REQUESTED });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  // Same wording for "no such account" and "wrong code", so verifying is not
  // the oracle that requesting refuses to be.
  const wrong = () => ApiError.unauthorized('That code is wrong or has expired. Ask for a new one.');
  if (!user) throw wrong();
  if (!user.isActive) throw ApiError.forbidden('This account has been disabled');

  const outcome = await redeemToken(user, 'otp', code);
  if (outcome === 'too-many-attempts') {
    throw ApiError.unauthorized('Too many wrong codes. Ask for a new one.');
  }
  if (outcome !== 'ok') throw wrong();

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ success: true, token, user: user.toPublic() });
});
