import Counter from '../models/Counter.js';

/**
 * Atomically generates a human-readable reference like CD-QT-000123.
 * Sequence state lives in the `counters` collection so numbers never repeat.
 */
export async function nextReference(scope, prefix, pad = 6) {
  const doc = await Counter.findOneAndUpdate(
    { scope },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(doc.seq).padStart(pad, '0')}`;
}
