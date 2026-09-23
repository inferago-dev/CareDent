import dotenv from 'dotenv';
dotenv.config();

const bool = (v, fallback = false) =>
  v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/caredent',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  admin: {
    email: process.env.ADMIN_EMAIL || 'caredent73@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'CareDent@2025',
    name: process.env.ADMIN_NAME || 'Sivakumar',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    // caredent.net is the domain the site is served from. The old default
    // was no-reply@caredent.com, which Care Dent does not own: mail from it
    // fails SPF and DKIM alignment at the receiver and is filtered as
    // spoofing. Whatever this is set to must be an address the configured
    // SMTP account is allowed to send as - Gmail, for one, rewrites From to
    // the authenticated account unless the address is a verified alias.
    from: process.env.MAIL_FROM || 'Care Dent <no-reply@caredent.net>',
    notifyTo: process.env.NOTIFY_EMAIL || '',
  },
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 10),
  /**
   * Object storage for uploads. Any S3-compatible bucket: AWS S3, Cloudflare
   * R2, Backblaze B2, DigitalOcean Spaces. Leave S3_BUCKET unset and uploads
   * fall back to ./uploads, which is right for development and lossy anywhere
   * the filesystem is rebuilt on deploy - see config/storage.js.
   */
  s3: {
    bucket: process.env.S3_BUCKET || '',
    region: process.env.S3_REGION || 'auto',
    // Only for non-AWS providers; AWS derives its own from the region.
    endpoint: process.env.S3_ENDPOINT || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  /**
   * Google sign-in. Dormant until both halves are set: the button is hidden
   * and the routes answer 404, so a deployment without a Google Cloud project
   * behaves exactly as it did before.
   */
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    /**
     * Where Google sends the browser back - an address on this API, not on
     * the website. It has to match a redirect URI registered on the OAuth
     * client character for character, so it is configured rather than derived
     * from the request: a proxy header would otherwise be able to change it,
     * and the failure surfaces as Google's opaque redirect_uri_mismatch.
     */
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  },
};

/**
 * Whether Google sign-in is available on this deployment.
 *
 * All three parts or none: a client id with no redirect URI produces a sign-in
 * button that always ends on Google's error page, which is worse than no
 * button at all.
 */
export const googleEnabled = Boolean(
  env.google.clientId && env.google.clientSecret && env.google.redirectUri
);

if (env.google.clientId && !googleEnabled) {
  console.warn(
    '[startup] Google sign-in is half-configured and stays disabled. It needs\n' +
    '          GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI.'
  );
}

export const isProd = env.nodeEnv === 'production';

// Refuse to boot in production with a known-insecure default. These fall back
// silently in dev so the app runs out of the box, but shipping them live
// means anyone who has read this file (or the public repo) can sign JWTs or
// log into /admin.
if (isProd) {
  const problems = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-only-insecure-secret') {
    problems.push('JWT_SECRET is missing or using the default dev value');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'CareDent@2025') {
    problems.push('ADMIN_PASSWORD is missing or using the default value');
  }
  // The reset link and the sign-in code are emailed. Without a working
  // transport both flows accept the request, log the message to the console
  // and leave the customer waiting for mail that will never arrive.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      '[startup] SMTP is not configured - password reset and email sign-in codes\n' +
      '          cannot be delivered. Set SMTP_HOST, SMTP_USER and SMTP_PASS.'
    );
  }
  if (problems.length) {
    console.error('\n[startup] Refusing to start in production with insecure defaults:');
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error('  Set real values in your production environment and redeploy.\n');
    process.exit(1);
  }
}
