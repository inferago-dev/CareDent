import ApiError from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    error = new ApiError(400, 'Please check the highlighted fields', details);
  } else if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}`);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    error = new ApiError(409, `That ${field} is already in use`);
  } else if (err.name === 'MulterError') {
    error = new ApiError(400, err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message);
  } else if (!(err instanceof ApiError)) {
    error = new ApiError(err.statusCode || 500, err.message || 'Something went wrong');
  }

  if (error.statusCode >= 500) console.error(err);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { errors: error.details } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
