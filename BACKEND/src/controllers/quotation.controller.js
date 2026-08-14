import Quotation from '../models/Quotation.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { nextReference } from '../utils/reference.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { sendMail, detailsTable } from '../utils/mailer.js';

export const createQuotation = asyncHandler(async (req, res) => {
  const reference = await nextReference('quotation', 'CD-QT-');

  const quotation = await Quotation.create({
    ...req.body,
    reference,
    user: req.user?._id,
  });

  // Fire-and-forget: the customer must not wait on SMTP.
  sendMail({
    subject: `New quote request ${reference} - ${quotation.product}`,
    replyTo: quotation.email,
    html: detailsTable('New Quote Request', [
      ['Reference', reference],
      ['Product', quotation.product],
      ['Quantity', quotation.quantity],
      ['Name', quotation.name],
      ['Clinic', quotation.clinicName],
      ['Phone', quotation.phone],
      ['Email', quotation.email],
      ['Address', quotation.address],
      ['Notes', quotation.notes],
    ]),
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Quote request received',
    data: { reference: quotation.reference, id: quotation._id, createdAt: quotation.createdAt },
  });
});

export const myQuotations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { user: req.user._id };

  const [items, total] = await Promise.all([
    Quotation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Quotation.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const trackQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findOne({ reference: req.params.reference.toUpperCase() })
    .select('reference product quantity status quotedAmount validTill createdAt')
    .lean();
  if (!quotation) throw ApiError.notFound('No quotation found with that reference');
  res.json({ success: true, data: quotation });
});

/* ------------------------- admin ------------------------- */

export const adminListQuotations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(req.query.q, 'i');
    filter.$or = [{ reference: rx }, { name: rx }, { clinicName: rx }, { email: rx }, { product: rx }];
  }

  const [items, total] = await Promise.all([
    Quotation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    Quotation.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const adminGetQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id).populate('user', 'name email phone').lean();
  if (!quotation) throw ApiError.notFound('Quotation not found');
  res.json({ success: true, data: quotation });
});

export const adminUpdateQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!quotation) throw ApiError.notFound('Quotation not found');

  if (req.body.status === 'Quoted' && quotation.email) {
    sendMail({
      to: quotation.email,
      subject: `Your Care Dent quotation ${quotation.reference}`,
      html: detailsTable('Your quotation is ready', [
        ['Reference', quotation.reference],
        ['Product', quotation.product],
        ['Quantity', quotation.quantity],
        ['Amount', quotation.quotedAmount ? `Rs. ${quotation.quotedAmount.toLocaleString('en-IN')}` : 'See attached'],
        ['Valid till', quotation.validTill ? new Date(quotation.validTill).toLocaleDateString('en-IN') : ''],
      ]),
    }).catch(() => {});
  }

  res.json({ success: true, data: quotation });
});

export const adminDeleteQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findByIdAndDelete(req.params.id);
  if (!quotation) throw ApiError.notFound('Quotation not found');
  res.json({ success: true, message: 'Quotation deleted' });
});
