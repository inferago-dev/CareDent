import Invoice from '../models/Invoice.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { nextReference } from '../utils/reference.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { containsRegex } from '../utils/escapeRegex.js';

export const myInvoices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { user: req.user._id, status: { $ne: 'Draft' } };

  const [items, total] = await Promise.all([
    Invoice.find(filter).sort({ issuedOn: -1 }).skip(skip).limit(limit).lean(),
    Invoice.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

/* ------------------------- admin ------------------------- */

export const adminListInvoices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const rx = containsRegex(req.query.q);
    filter.$or = [{ reference: rx }, { customerName: rx }, { clinicName: rx }];
  }

  const [items, total] = await Promise.all([
    Invoice.find(filter).sort({ issuedOn: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    Invoice.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const adminCreateInvoice = asyncHandler(async (req, res) => {
  const reference = await nextReference('invoice', `INV-${new Date().getFullYear()}-`, 4);
  const invoice = await Invoice.create({ ...req.body, reference, status: 'Sent' });
  res.status(201).json({ success: true, data: invoice });
});

export const adminUpdateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  Object.assign(invoice, req.body);
  await invoice.save();
  res.json({ success: true, data: invoice });
});

export const adminRecordPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');

  invoice.amountPaid = Math.min(req.body.amountPaid, invoice.amount);
  if (req.body.paymentMethod) invoice.paymentMethod = req.body.paymentMethod;
  await invoice.save();

  res.json({ success: true, data: invoice });
});

export const adminDeleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  res.json({ success: true, message: 'Invoice deleted' });
});
