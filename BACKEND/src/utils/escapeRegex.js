/**
 * Escapes regex metacharacters in free-text search input.
 *
 * Every admin/catalogue list builds a `new RegExp(userInput, 'i')` filter. Left
 * raw, a search for "(" is a 500, ".*" scans the whole collection, and a
 * nested-quantifier pattern is a ReDoS that pins the event loop.
 */
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds a case-insensitive "contains" matcher from untrusted input. */
export const containsRegex = (value) => new RegExp(escapeRegex(value), 'i');

/** Builds a case-insensitive exact matcher from untrusted input. */
export const exactRegex = (value) => new RegExp(`^${escapeRegex(value)}$`, 'i');

export default escapeRegex;
