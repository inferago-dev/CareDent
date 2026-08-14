import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { env, isProd } from './config/env.js';
import { UPLOAD_ROOT } from './middleware/upload.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = env.clientUrl.split(',').map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin/non-browser callers (curl, health checks) and configured origins.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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

// Uploaded product images / brochures
app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d' }));

app.use('/api', routes);

app.get('/', (_req, res) =>
  res.json({ success: true, message: 'Care Dent API. See /api/health' })
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
