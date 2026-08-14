import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { nextReference } from '../utils/reference.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { sendMail, detailsTable } from '../utils/mailer.js';
import { applyStockForOrder } from './inventory.controller.js';

/** Public tracking - returns only what is safe to show without signing in. */
export const trackOrder = asyncHandler(async (req, res) => {
  const reference = String(req.params.reference || '').trim().toUpperCase();
  const order = await Order.findOne({ reference })
    .select('reference status timeline items expectedDelivery deliveredAt installationDate createdAt clinicName customerName assignedEngineer')
    .lean();

  if (!order) throw ApiError.notFound('We could not find an order with that reference. Please check and try again.');

  res.json({
    success: true,
    data: {
      reference: order.reference,
      status: order.status,
      placedOn: order.createdAt,
      expectedDelivery: order.expectedDelivery,
      deliveredAt: order.deliveredAt,
      installationDate: order.installationDate,
      assignedEngineer: order.assignedEngineer,
      // Mask the customer name - only the initial is shown publicly.
      customer: order.clinicName || `${order.customerName.split(' ')[0]} ...`,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      timeline: order.timeline,
    },
  });
});

export const myOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { user: req.user._id };

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const myOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: order });
});

/* ------------------------- admin ------------------------- */

export const adminListOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(req.query.q, 'i');
    filter.$or = [{ reference: rx }, { customerName: rx }, { clinicName: rx }, { phone: rx }];
  }

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const adminGetOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone').lean();
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, data: order });
});

export const adminCreateOrder = asyncHandler(async (req, res) => {
  const reference = await nextReference('order', 'ORD-');
  const order = await Order.create({ ...req.body, reference });
  await applyStockForOrder(order, null);
  await order.save();

  if (order.email) {
    sendMail({
      to: order.email,
      subject: `Care Dent order confirmed - ${order.reference}`,
      html: detailsTable('Your order is confirmed', [
        ['Order reference', order.reference],
        ['Items', order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')],
        ['Total', `Rs. ${order.totalAmount.toLocaleString('en-IN')}`],
        ['Track at', '/track-order'],
      ]),
    }).catch(() => {});
  }

  res.status(201).json({ success: true, data: order });
});

export const adminUpdateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  const previousStatus = order.status;
  const { status, note, ...rest } = req.body;
  Object.assign(order, rest);

  if (status && status !== order.status) {
    order.status = status;
    order.timeline.push({ status, note: note || `Status changed to ${status}` });
    if (status === 'Delivered') order.deliveredAt = new Date();
  } else if (note) {
    order.timeline.push({ status: order.status, note });
  }

  await applyStockForOrder(order, previousStatus);
  await order.save();
  res.json({ success: true, data: order });
});

export const adminDeleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ success: true, message: 'Order deleted' });
});
