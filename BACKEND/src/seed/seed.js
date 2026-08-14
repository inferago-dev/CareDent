/**
 * Seeds the database with the Care Dent catalogue, the admin account and,
 * with --demo, a small set of sample customers / orders / tickets so the
 * portal and admin screens have something to show.
 *
 *   npm run seed              # catalogue + admin (idempotent upsert)
 *   npm run seed -- --demo    # ... plus demo customer data
 *   npm run seed:fresh        # wipes collections first
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { PRODUCTS, SERVICES } from './data.js';

import User from '../models/User.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import ServiceTicket from '../models/ServiceTicket.js';
import Invoice from '../models/Invoice.js';
import Counter from '../models/Counter.js';
import { nextReference } from '../utils/reference.js';

const args = process.argv.slice(2);
const FRESH = args.includes('--fresh');
const DEMO = args.includes('--demo') || FRESH;

const log = (...a) => console.log('[seed]', ...a);

async function run() {
  await connectDB();

  if (FRESH) {
    log('--fresh: clearing collections');
    await Promise.all([
      Product.deleteMany({}), Service.deleteMany({}), Order.deleteMany({}),
      Quotation.deleteMany({}), ServiceTicket.deleteMany({}), Invoice.deleteMany({}),
      Counter.deleteMany({}), User.deleteMany({}),
    ]);
  }

  /* ---------- admin ---------- */
  let admin = await User.findOne({ email: env.admin.email });
  if (!admin) {
    admin = await User.create({
      name: env.admin.name,
      email: env.admin.email,
      password: env.admin.password,
      role: 'admin',
      phone: '+91 94441 53599',
    });
    log(`admin created -> ${admin.email} / ${env.admin.password}`);
  } else {
    log(`admin already exists -> ${admin.email}`);
  }

  /* ---------- catalogue ---------- */
  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  log(`${PRODUCTS.length} products upserted`);

  for (const s of SERVICES) {
    await Service.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  log(`${SERVICES.length} services upserted`);

  if (!DEMO) {
    log('done (pass --demo for sample customer data)');
    return;
  }

  /* ---------- demo customer ---------- */
  const demoEmail = 'demo@clinic.com';
  let customer = await User.findOne({ email: demoEmail });
  if (!customer) {
    customer = await User.create({
      name: 'Dr. A. Ramesh',
      email: demoEmail,
      password: 'Demo@12345',
      role: 'customer',
      phone: '+91 98400 11223',
      clinicName: 'Ramesh Multispecialty Dental Center',
      city: 'Chennai',
      address: 'No. 12, Anna Nagar West, Chennai - 600 040',
    });
    log(`demo customer created -> ${demoEmail} / Demo@12345`);
  }

  if ((await Order.countDocuments()) === 0) {
    const chair = await Product.findOne({ slug: 'gamma-overhanging' });
    const xray = await Product.findOne({ slug: 'portable-x-ray-units' });

    const o1 = await Order.create({
      reference: await nextReference('order', 'ORD-'),
      user: customer._id,
      customerName: customer.name,
      clinicName: customer.clinicName,
      phone: customer.phone,
      email: customer.email,
      deliveryAddress: customer.address,
      items: [{ product: chair?._id, name: chair?.name || 'Gamma Overhanging', quantity: 1, unitPrice: 245000 }],
      status: 'Delivered',
      deliveredAt: new Date(),
      assignedEngineer: 'Sivakumar',
      timeline: [
        { status: 'Confirmed', note: 'Advance received' },
        { status: 'Processing', note: 'Unit allocated from stock' },
        { status: 'Dispatched', note: 'Dispatched from Chennai warehouse' },
        { status: 'Installation Scheduled', note: 'Installation booked' },
        { status: 'Delivered', note: 'Installed and commissioned' },
      ],
    });

    const o2 = await Order.create({
      reference: await nextReference('order', 'ORD-'),
      user: customer._id,
      customerName: customer.name,
      clinicName: customer.clinicName,
      phone: customer.phone,
      email: customer.email,
      items: [{ product: xray?._id, name: xray?.name || 'Portable X-Ray Unit', quantity: 2, unitPrice: 57500 }],
      status: 'Processing',
      expectedDelivery: new Date(Date.now() + 7 * 864e5),
    });

    await Quotation.create({
      reference: await nextReference('quotation', 'CD-QT-'),
      user: customer._id,
      name: customer.name,
      clinicName: customer.clinicName,
      phone: customer.phone,
      email: customer.email,
      product: 'Gamma Premium',
      quantity: 2,
      notes: 'Need matching compressor and AMC quote.',
      status: 'Quoted',
      quotedAmount: 490000,
      validTill: new Date(Date.now() + 30 * 864e5),
    });

    await ServiceTicket.create({
      reference: await nextReference('ticket', 'TKT-'),
      user: customer._id,
      clinicName: customer.clinicName,
      contactName: customer.name,
      phone: customer.phone,
      email: customer.email,
      equipment: 'Gamma Overhanging (Chair #1)',
      serviceType: 'AMC Visit',
      issue: 'Routine annual AMC check and suction flush.',
      priority: 'Medium',
      status: 'Engineer Assigned',
      assignedEngineer: 'Sivakumar',
      scheduledFor: new Date(Date.now() + 3 * 864e5),
    });

    await Invoice.create({
      reference: await nextReference('invoice', `INV-${new Date().getFullYear()}-`, 4),
      user: customer._id,
      order: o1._id,
      customerName: customer.name,
      clinicName: customer.clinicName,
      description: 'Supply & installation of Gamma Overhanging chair',
      lines: [{ description: 'Gamma Overhanging Dental Chair', quantity: 1, unitPrice: 245000 }],
      amountPaid: 289100,
      paymentMethod: 'Bank Transfer',
      status: 'Sent',
    });

    log(`demo orders ${o1.reference}, ${o2.reference} + quotation, ticket and invoice created`);
  }

  log('done');
}

run()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState === 1) await disconnectDB();
  });
