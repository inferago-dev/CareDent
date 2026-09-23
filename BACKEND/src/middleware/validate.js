import ApiError from '../utils/ApiError.js';
import { discardUploads } from './upload.js';

/**
 * validate({ body: schema, query: schema, params: schema })
 * Replaces the request part with the parsed value so controllers get clean data.
 *
 * On multipart routes this runs after multer has already written the files, so
 * a rejected request has its attachments removed rather than orphaned on disk.
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const key of ['body', 'query', 'params']) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      discardUploads(req);
      return next(ApiError.badRequest('Please check the highlighted fields', details));
    }
    req[key] = result.data;
  }
  next();
};

export default validate;
