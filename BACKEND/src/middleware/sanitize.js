/**
 * Strips keys starting with "$" or containing "." from anything the caller
 * controls, so a request can never smuggle a Mongo operator into a query
 * (e.g. { email: { "$gt": "" } } turning a login lookup into "any user").
 */
function stripOperators(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(stripOperators);
    return obj;
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }
      stripOperators(obj[key]);
    }
  }
  return obj;
}

export function mongoSanitize(req, _res, next) {
  if (req.body) stripOperators(req.body);
  if (req.params) stripOperators(req.params);

  // Express 5 defines req.query as a getter that re-parses the query string on
  // every access, so mutating what it returns sanitises a throwaway object and
  // the next read hands the raw values straight back. Replace the getter with
  // the sanitised result instead.
  const query = stripOperators({ ...req.query });
  Object.defineProperty(req, 'query', {
    value: query,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
}

export { stripOperators };
export default mongoSanitize;
