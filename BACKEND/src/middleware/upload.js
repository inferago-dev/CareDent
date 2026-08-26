import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

/**
 * Allowed types, each mapped to the extension the file will be saved with.
 *
 * The extension is derived from the mimetype and never from the name the
 * client sent. express.static picks a Content-Type from the file extension,
 * so honouring `originalname` let anyone upload "plan.html" declared as
 * image/png and have it served back as text/html from our own origin - a
 * stored XSS on an endpoint (POST /api/site-assessments) that needs no login.
 *
 * SVG is deliberately absent: browsers execute script inside an SVG served as
 * image/svg+xml, so accepting one is the same hole by a different route.
 */
const IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};
const DOC_TYPES = {
  'application/pdf': '.pdf',
};
const EXTENSION_FOR = { ...IMAGE_TYPES, ...DOC_TYPES };

const isImage = (mimetype) => Object.hasOwn(IMAGE_TYPES, mimetype);
const bucketFor = (mimetype) => (isImage(mimetype) ? 'images' : 'documents');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, ensureDir(path.join(UPLOAD_ROOT, bucketFor(file.mimetype))));
  },
  filename(req, file, cb) {
    const safe = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'file';
    cb(null, `${safe}-${crypto.randomBytes(6).toString('hex')}${EXTENSION_FOR[file.mimetype]}`);
  },
});

function fileFilter(req, file, cb) {
  if (!Object.hasOwn(EXTENSION_FOR, file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}. Upload a JPEG, PNG, WebP, AVIF or PDF.`));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 8 },
});

export const publicUrlFor = (file) => `/uploads/${bucketFor(file.mimetype)}/${file.filename}`;

/**
 * Deletes files multer already wrote to disk. Validation runs after the upload
 * (the body is only parseable once multipart has been consumed), so a rejected
 * request would otherwise leave its attachments behind forever.
 */
export function discardUploads(req) {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    fs.promises.unlink(file.path).catch(() => {});
  }
}

/** Express error/validation middleware wrapper: clean up, then keep going. */
export const cleanupOnFailure = (err, req, _res, next) => {
  discardUploads(req);
  next(err);
};

export { UPLOAD_ROOT, isImage };
