import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { putObject, deleteObject } from '../config/storage.js';

/**
 * Allowed types, each mapped to the extension the file will be saved with.
 *
 * The extension is derived from the mimetype and never from the name the
 * client sent. A stored object is served back with a Content-Type picked from
 * its extension, so honouring `originalname` let anyone upload "plan.html"
 * declared as image/png and have it served back as text/html from our own
 * origin - a stored XSS on an endpoint (POST /api/site-assessments) that needs
 * no login.
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

/** "Floor plan.PNG" -> "floor-plan-9f3a1c2b4d5e.png". */
function keyFor(file) {
  const safe = path
    .basename(file.originalname, path.extname(file.originalname))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';
  const unique = crypto.randomBytes(6).toString('hex');
  return `${bucketFor(file.mimetype)}/${safe}-${unique}${EXTENSION_FOR[file.mimetype]}`;
}

/**
 * A multer storage engine that writes through config/storage.js rather than
 * straight to disk, so the same route code works against a bucket or a local
 * directory depending on what is configured.
 *
 * Streaming rather than buffering is deliberate: eight 10 MB attachments
 * buffered in memory is 80 MB held per in-flight request, and the public
 * site-assessment form takes six of them without a login.
 */
const storageEngine = {
  _handleFile(req, file, cb) {
    const key = keyFor(file);
    putObject(key, file.stream, file.mimetype)
      // multer merges this onto the `file` object the controllers receive.
      .then(() => cb(null, { key, filename: path.basename(key), mimetype: file.mimetype }))
      .catch(cb);
  },
  _removeFile(req, file, cb) {
    deleteObject(file.key).then(() => cb(null), cb);
  },
};

function fileFilter(req, file, cb) {
  if (!Object.hasOwn(EXTENSION_FOR, file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}. Upload a JPEG, PNG, WebP, AVIF or PDF.`));
  }
  cb(null, true);
}

export const upload = multer({
  storage: storageEngine,
  fileFilter,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 8 },
});

/**
 * The path this file is served back from. Unchanged from when uploads were a
 * static directory, so every URL already stored on a Product, Document or
 * ServiceTicket keeps resolving.
 */
export const publicUrlFor = (file) => `/uploads/${file.key}`;

/**
 * Removes files the upload already committed. Validation runs after the
 * transfer - the body is only parseable once multipart has been consumed - so
 * a rejected request would otherwise leave its attachments behind forever.
 */
export function discardUploads(req) {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    if (file?.key) deleteObject(file.key);
  }
}

/** Express error/validation middleware wrapper: clean up, then keep going. */
export const cleanupOnFailure = (err, req, _res, next) => {
  discardUploads(req);
  next(err);
};

export { isImage, EXTENSION_FOR };
