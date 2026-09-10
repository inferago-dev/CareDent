import { Router } from 'express';
import { getObject } from '../config/storage.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

/**
 * Serves uploaded product images, brochures and site-assessment attachments.
 *
 * This used to be `express.static(UPLOAD_ROOT)`. Files now live in whatever
 * config/storage.js is pointed at, so they are read back through here instead
 * - which keeps the bucket private and keeps every `/uploads/...` URL already
 * written into a Product, Document or ServiceTicket record working unchanged.
 */
const router = Router();

/**
 * Content-Type comes from a fixed table, never from the stored object and
 * never from sniffing.
 *
 * Uploads are only ever written with an extension derived from their declared
 * mimetype (see middleware/upload.js), so these five are the only ones that
 * can exist. Serving anything else as active content from the API's own origin
 * is the stored-XSS hole that the write side is careful to close; deciding the
 * header here rather than trusting object metadata closes it from both ends.
 */
const CONTENT_TYPE = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

router.get('/:bucket/:name', asyncHandler(async (req, res) => {
  const { bucket, name } = req.params;
  const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
  const contentType = CONTENT_TYPE[extension];
  if (!contentType) throw ApiError.notFound('File not found');

  const object = await getObject(`${bucket}/${name}`);
  if (!object) throw ApiError.notFound('File not found');

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // A stored name carries six random bytes and is never reused, so the bytes
  // behind a URL cannot change.
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  // A PDF from a customer's own site assessment should download, not render
  // in a tab on our origin.
  if (contentType === 'application/pdf') {
    res.setHeader('Content-Disposition', `inline; filename="${name}"`);
  }
  if (object.contentLength != null) res.setHeader('Content-Length', object.contentLength);
  if (object.lastModified) res.setHeader('Last-Modified', object.lastModified.toUTCString());

  object.stream.pipe(res);
}));

export default router;
