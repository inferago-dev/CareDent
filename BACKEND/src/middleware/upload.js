import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
  doc: ['application/pdf'],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const bucket = ALLOWED.image.includes(file.mimetype) ? 'images' : 'documents';
    cb(null, ensureDir(path.join(UPLOAD_ROOT, bucket)));
  },
  filename(req, file, cb) {
    const safe = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'file';
    cb(null, `${safe}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = [...ALLOWED.image, ...ALLOWED.doc];
  if (!allowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}. Upload an image or a PDF.`));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 8 },
});

export const publicUrlFor = (file) =>
  `/uploads/${ALLOWED.image.includes(file.mimetype) ? 'images' : 'documents'}/${file.filename}`;

export { UPLOAD_ROOT };
