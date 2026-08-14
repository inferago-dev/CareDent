import ApiError from '../utils/ApiError.js';

/**
 * validate({ body: schema, query: schema, params: schema })
 * Replaces the request part with the parsed value so controllers get clean data.
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
      return next(ApiError.badRequest('Please check the highlighted fields', details));
    }
    if (key === 'query') {
      Object.defineProperty(req, 'validatedQuery', { value: result.data, writable: true });
    } else {
      req[key] = result.data;
    }
  }
  next();
};

export default validate;
