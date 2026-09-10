import crypto from 'node:crypto';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../middleware/auth.js';
import { setAuthCookie } from './auth.controller.js';
import { env, isProd, googleEnabled } from '../config/env.js';
import { issueToken, redeemTokenByValue, generateToken } from '../models/AuthToken.js';

/**
 * "Continue with Google", as the authorization-code flow.
 *
 * The browser never handles the client secret and never sees an access token;
 * the code is exchanged server to server. The implicit alternative would put a
 * token in a URL fragment, where it lands in history and in any Referer the
 * next navigation sends.
 *
 * The whole feature is dormant unless GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET are both set: the routes answer 404 and the sign-in
 * page hides the button, so a deployment with no Google Cloud project behaves
 * exactly as it did before this existed.
 */

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

const STATE_COOKIE = 'g_oauth_state';
/** Long enough to choose an account and type a password, short enough to matter. */
const STATE_TTL_MS = 10 * 60 * 1000;
/**
 * The hand-off code is redeemed by a fetch the page makes as soon as it
 * loads, so it only has to outlive one redirect.
 */
const EXCHANGE_TTL_MS = 60 * 1000;

/** The site to send the browser back to; CLIENT_URL may list several origins. */
const siteUrl = () => env.clientUrl.split(',')[0].trim().replace(/\/+$/, '');


const requireGoogle = () => {
  if (!googleEnabled) throw ApiError.notFound('Google sign-in is not enabled on this deployment');
};

/** Sends the browser back to the sign-in page with something it can render. */
const failTo = (res, reason) =>
  res.redirect(`${siteUrl()}/login?error=${encodeURIComponent(reason)}`);

/* ------------------------------ step 1 ------------------------------ */

export const startGoogle = asyncHandler(async (req, res) => {
  requireGoogle();

  // CSRF for the redirect: Google echoes this back, and a callback that
  // arrives without the matching cookie was not started by this browser.
  const state = crypto.randomBytes(16).toString('base64url');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    // The callback is a top-level navigation from accounts.google.com, so the
    // cookie has to survive a cross-site GET. Lax does exactly that and, unlike
    // None, still refuses to ride along on cross-site POSTs and subrequests.
    sameSite: 'lax',
    path: '/',
    maxAge: STATE_TTL_MS,
  });

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    // Without this Google silently reuses the last account on a shared
    // machine, which in a clinic is the wrong default.
    prompt: 'select_account',
  });

  res.redirect(`${AUTHORIZE_URL}?${params}`);
});

/* ------------------------------ step 2 ------------------------------ */

export const googleCallback = asyncHandler(async (req, res) => {
  requireGoogle();

  const { code, state, error } = req.query;
  const expected = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });

  // The visitor pressed Cancel on Google's consent screen.
  if (error) return failTo(res, 'cancelled');
  if (!code || !state || !expected) return failTo(res, 'google-failed');
  // Fixed-time compare: the state is a secret for the length of one redirect.
  const given = Buffer.from(String(state));
  const want = Buffer.from(String(expected));
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return failTo(res, 'google-failed');
  }

  let profile;
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: env.google.clientId,
        client_secret: env.google.clientSecret,
        redirect_uri: env.google.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error(`token exchange failed: HTTP ${tokenRes.status}`);
    const { access_token: accessToken } = await tokenRes.json();

    // Asking Google who the token belongs to, rather than decoding the
    // id_token ourselves. Same answer, and nothing here has to be trusted to
    // verify a signature correctly.
    const infoRes = await fetch(USERINFO_URL, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!infoRes.ok) throw new Error(`userinfo failed: HTTP ${infoRes.status}`);
    profile = await infoRes.json();
  } catch (err) {
    console.error(`[google] ${err.message}`);
    return failTo(res, 'google-failed');
  }

  const { sub, email, email_verified: emailVerified, name } = profile;
  if (!sub || !email) return failTo(res, 'google-failed');

  /*
   * An unverified address must not reach an existing account. Google will
   * issue a profile for an address the holder has not proven they control, and
   * matching on that would let anyone who can create such a profile walk into
   * the Care Dent account registered to the same address.
   */
  if (!emailVerified) return failTo(res, 'google-unverified');

  const normalisedEmail = String(email).toLowerCase().trim();
  let user = await User.findOne({ googleId: sub });

  if (!user) {
    user = await User.findOne({ email: normalisedEmail });
    if (user) {
      // Same verified address, so this is the same person arriving a new way.
      user.googleId = sub;
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        googleId: sub,
        email: normalisedEmail,
        name: name || normalisedEmail.split('@')[0],
        // Never from the profile: Google does not decide who is an admin here.
        role: 'customer',
      });
    }
  }

  if (!user.isActive) return failTo(res, 'account-disabled');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  /*
   * Hand the session over through a single-use code rather than the JWT
   * itself. The app keeps its token in localStorage, so the token has to reach
   * JavaScript somehow - and a JWT in a redirect URL is written to browser
   * history and offered to the next page as a Referer. This code is worth
   * nothing sixty seconds later or a second time.
   */
  const handoff = generateToken();
  await issueToken(user, 'oauth-exchange', handoff, EXCHANGE_TTL_MS);
  res.redirect(`${siteUrl()}/auth/google?code=${encodeURIComponent(handoff)}`);
});

/* ------------------------------ step 3 ------------------------------ */

export const exchangeGoogleCode = asyncHandler(async (req, res) => {
  requireGoogle();

  const userId = await redeemTokenByValue('oauth-exchange', req.body.code);
  if (!userId) throw ApiError.unauthorized('That sign-in link has expired. Please try again.');

  const user = await User.findById(userId);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or disabled');

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ success: true, token, user: user.toPublic() });
});
