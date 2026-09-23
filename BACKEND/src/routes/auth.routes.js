import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import * as c from '../controllers/auth.controller.js';
import * as google from '../controllers/google.controller.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { googleEnabled } from '../config/env.js';
import {
  registerSchema, loginSchema, updateMeSchema, changePasswordSchema,
  forgotPasswordSchema, resetPasswordSchema, requestOtpSchema, verifyOtpSchema,
  oauthExchangeSchema,
} from '../validators/schemas.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

/**
 * Anything that puts mail in someone's inbox.
 *
 * Tighter than the sign-in limit because the cost of abuse lands on a third
 * party: an unthrottled reset endpoint is a way to have Care Dent's mail
 * server flood an address the sender does not own, which is how a domain
 * earns a spam reputation.
 *
 * Keyed on the address as well as the IP, so one client cannot walk a list of
 * addresses from a single IP and one address cannot be hit from many.
 */
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || '').toLowerCase()}`,
  message: {
    success: false,
    message: 'Too many requests for that address. Please wait a few minutes before trying again.',
  },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), c.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), c.login);
router.post('/logout', c.logout);

/* ---- forgotten password ---- */
router.post('/forgot-password', emailLimiter, validate({ body: forgotPasswordSchema }), c.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), c.resetPassword);

/* ---- sign in with an emailed code ---- */
router.post('/otp/request', emailLimiter, validate({ body: requestOtpSchema }), c.requestOtp);
router.post('/otp/verify', authLimiter, validate({ body: verifyOtpSchema }), c.verifyOtp);

/**
 * What the sign-in page should offer.
 *
 * Google is optional and configured per deployment, so the page has to ask
 * rather than assume - a button that leads to a 404 is worse than no button.
 */
router.get('/providers', (_req, res) =>
  res.json({ success: true, providers: { google: googleEnabled } })
);

/* ---- sign in with Google ---- */
// The first two are browser navigations, not fetches: Google redirects into
// the callback. They answer 404 unless the OAuth client is configured.
router.get('/google', authLimiter, google.startGoogle);
router.get('/google/callback', google.googleCallback);
router.post('/google/exchange', authLimiter, validate({ body: oauthExchangeSchema }), google.exchangeGoogleCode);

router.get('/me', protect, c.me);
router.patch('/me', protect, validate({ body: updateMeSchema }), c.updateMe);
router.patch('/me/password', protect, validate({ body: changePasswordSchema }), c.changePassword);

export default router;
