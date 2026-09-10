import mongoose from 'mongoose';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

/**
 * Short-lived, single-use credentials: password-reset links, sign-in codes and
 * the hand-off code the Google callback redirects with.
 *
 * They live here rather than as more fields on User because they are a
 * different shape of thing - one user can have several in flight, they expire
 * on their own, and none should survive being used once. A TTL index reaps
 * them, so nothing accumulates and no cleanup job is needed.
 *
 * Nothing here is stored in a form that can be replayed. A dump of this
 * collection yields hashes and expiry times, not working reset links.
 */

export const TOKEN_KINDS = ['password-reset', 'otp', 'oauth-exchange'];

/** Wrong guesses allowed against one code before it is burned. */
export const MAX_ATTEMPTS = 5;

const authTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: TOKEN_KINDS, required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

authTokenSchema.index({ user: 1, kind: 1 });
// Mongo drops each document within a minute or so of expiresAt passing. This
// is housekeeping, not the security boundary - every read below checks the
// date itself, because the reaper runs on its own schedule and may not have
// come past yet.
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthToken = mongoose.model('AuthToken', authTokenSchema);
export default AuthToken;

/* ------------------------------------------------------------------ *
 * Issuing and redeeming
 * ------------------------------------------------------------------ */

/**
 * Two hashes, because the two kinds of secret have different weaknesses.
 *
 * A 256-bit random token cannot be guessed, so SHA-256 suits it: the lookup
 * has to be fast and there is nothing to brute-force. A six-digit code carries
 * about 20 bits, which any GPU walks through in moments, so it gets bcrypt -
 * a cost paid once per verification and never in a loop.
 */
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const hashSecret = (kind, secret) =>
  kind === 'otp' ? bcrypt.hash(secret, 10) : Promise.resolve(sha256(secret));

const secretMatches = (kind, secret, hash) =>
  kind === 'otp' ? bcrypt.compare(secret, hash) : Promise.resolve(sha256(secret) === hash);

/** A 6-digit code, uniformly distributed - `% 1000000` would not be. */
export const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

/** A URL-safe 256-bit token for reset links and the OAuth hand-off. */
export const generateToken = () => crypto.randomBytes(32).toString('base64url');

/**
 * Issues a credential, replacing any of the same kind the user already holds.
 *
 * Replacing rather than accumulating means "email me another code" invalidates
 * the previous one, so a stack of live codes cannot build up, and each request
 * resets the attempt counter for the code it hands out.
 */
export async function issueToken(user, kind, secret, ttlMs) {
  await AuthToken.deleteMany({ user: user._id, kind });
  await AuthToken.create({
    user: user._id,
    kind,
    tokenHash: await hashSecret(kind, secret),
    expiresAt: new Date(Date.now() + ttlMs),
  });
}

/**
 * Redeems a high-entropy token without being told whose it is.
 *
 * The OAuth hand-off code arrives on its own - the browser posts it back
 * before there is any session to say who is asking - so the token has to
 * identify the user rather than the other way round. Safe only for the
 * SHA-256 kinds: it is a direct hash lookup, which a six-digit code would
 * turn into an offline guessing game against the whole collection.
 */
export async function redeemTokenByValue(kind, secret) {
  if (kind === 'otp') throw new Error('redeemTokenByValue is not safe for low-entropy codes');

  const record = await AuthToken.findOne({ kind, tokenHash: sha256(secret) });
  if (!record) return null;

  await record.deleteOne();
  return record.expiresAt > new Date() ? record.user : null;
}

/**
 * Checks a presented secret and consumes it on success.
 *
 * Returns one of 'ok', 'invalid' or 'too-many-attempts'. A wrong guess counts
 * against the record, and the record is destroyed once the allowance runs out
 * rather than left to be ground down - otherwise the five-guess limit only
 * costs an attacker a new request.
 */
export async function redeemToken(user, kind, secret) {
  const record = await AuthToken.findOne({ user: user._id, kind });
  if (!record) return 'invalid';

  if (record.expiresAt <= new Date()) {
    await record.deleteOne();
    return 'invalid';
  }

  if (await secretMatches(kind, secret, record.tokenHash)) {
    await record.deleteOne();
    return 'ok';
  }

  record.attempts += 1;
  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    return 'too-many-attempts';
  }
  await record.save();
  return 'invalid';
}
