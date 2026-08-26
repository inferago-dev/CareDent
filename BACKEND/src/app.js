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
import { UPLOAD_ROOT } from './middleware/upload.js';
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

// Uploaded product images / brochures. Uploads only ever land here with an
// extension derived from their mimetype (see middleware/upload.js), and these
// options make sure nothing else in the directory can be reached: no directory
// listings, no dotfiles, and no content-type sniffing on the way out.
app.use(
  '/uploads',
  express.static(UPLOAD_ROOT, {
    maxAge: '7d',
    index: false,
    dotfiles: 'deny',
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

app.use('/api', routes);

app.get('/', (_req, res) =>
  res.json({ success: true, message: 'Care Dent API. See /api/health' })
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
