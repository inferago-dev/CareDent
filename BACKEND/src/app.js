import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import ApiError from './utils/ApiError.js';
import { env, isProd } from './config/env.js';
import uploadRoutes from './routes/uploads.routes.js';
import mongoSanitize from './middleware/sanitize.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = env.clientUrl.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin/non-browser callers (curl, health checks) and configured origins.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      // A rejected origin is the caller's problem, not a server fault - without
      // this it reaches the error handler as an unrecognised Error and is
      // reported as a 500.
      cb(ApiError.forbidden(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize);
app.use(morgan(isProd ? 'combined' : 'dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

// Uploaded product images, brochures and site-assessment attachments. Read
// back from whatever store config/storage.js is pointed at - a bucket in
// production, ./uploads in development - rather than served straight off the
// filesystem, so the bucket can stay private. Only the two generated path
// segments are addressable: no directory listings and no dotfiles, because
// there is no directory to walk.
app.use('/uploads', uploadRoutes);

app.use('/api', routes);

app.get('/', (_req, res) =>
  res.json({ success: true, message: 'Care Dent API. See /api/health' })
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
