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
    email: process.env.ADMIN_EMAIL || 'admin@caredent.com',
    password: process.env.ADMIN_PASSWORD || 'CareDent@2025',
    name: process.env.ADMIN_NAME || 'Sivakumar',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Care Dent <no-reply@caredent.com>',
    notifyTo: process.env.NOTIFY_EMAIL || '',
  },
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 10),
};

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
  if (problems.length) {
    console.error('\n[startup] Refusing to start in production with insecure defaults:');
    problems.forEach((p) => console.error(`  - ${p}`));
    console.error('  Set real values in your production environment and redeploy.\n');
    process.exit(1);
  }
}
