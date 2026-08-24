/**
 * One-off cleanup for records left behind when AMC was dropped from the
 * catalogue. Seeding upserts the catalogue but never touches tickets or
 * quotations, so old rows keep showing "AMC" in the admin and portal screens.
 *
 *   node src/seed/purge-amc.js --dry    # report what would change
 *   node src/seed/purge-amc.js          # apply
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Service from '../models/Service.js';
import ServiceTicket from '../models/ServiceTicket.js';
import Quotation from '../models/Quotation.js';

const DRY = process.argv.slice(2).includes('--dry');
const log = (...a) => console.log('[purge-amc]', ...a);

// 'AMC Visit' is no longer in the ServiceTicket enum, so any ticket still
// holding it is stale; 'Routine Maintenance' is its closest live equivalent.
const TICKET_REPLACEMENT = 'Routine Maintenance';
const AMC = /\bAMC\b|annual maintenance contract/i;

async function run() {
  await connectDB();

  const services = await Service.find({ key: 'amc' }).lean();
  const tickets = await ServiceTicket.find({
    $or: [{ serviceType: 'AMC Visit' }, { issue: AMC }],
  }).lean();
  const quotations = await Quotation.find({ notes: AMC }).lean();

  log(`services: ${services.length}, tickets: ${tickets.length}, quotations: ${quotations.length}`);
  for (const t of tickets) log(`  ticket ${t.reference} -> ${t.serviceType}`);
  for (const q of quotations) log(`  quotation ${q.reference} -> ${q.notes}`);

  if (DRY) return log('--dry: nothing written');

  if (services.length) {
    await Service.deleteMany({ key: 'amc' });
    log(`${services.length} service(s) deleted`);
  }
  for (const t of tickets) {
    await ServiceTicket.updateOne({ _id: t._id }, {
      serviceType: t.serviceType === 'AMC Visit' ? TICKET_REPLACEMENT : t.serviceType,
      issue: t.issue?.replace(AMC, 'preventive maintenance'),
    });
  }
  for (const q of quotations) {
    await Quotation.updateOne({ _id: q._id }, { notes: q.notes.replace(AMC, 'maintenance') });
  }
  log('done');
}

run()
  .catch((err) => {
    console.error('[purge-amc] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState === 1) await disconnectDB();
  });
