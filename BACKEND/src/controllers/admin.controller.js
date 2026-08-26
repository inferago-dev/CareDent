import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import ServiceTicket from '../models/ServiceTicket.js';
import Invoice from '../models/Invoice.js';
import ContactMessage from '../models/ContactMessage.js';
import { LOW_STOCK_EXPR } from './inventory.controller.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { containsRegex } from '../utils/escapeRegex.js';

const OPEN_TICKETS = ['Open', 'Acknowledged', 'Engineer Assigned', 'Pending Parts', 'In Progress'];
const OPEN_ORDERS = ['Pending Confirmation', 'Confirmed', 'Processing', 'Pending Dispatch', 'Dispatched', 'Installation Scheduled'];

export const dashboard = asyncHandler(async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    customers, products, ordersTotal, ordersOpen,
    quotesNew, ticketsOpen, messagesNew,
    revenueAgg, recentOrders, recentQuotes, recentTickets, monthlyAgg,
    lowStockItems, outOfStockCount,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer', isActive: true }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: OPEN_ORDERS } }),
    Quotation.countDocuments({ status: 'New' }),
    ServiceTicket.countDocuments({ status: { $in: OPEN_TICKETS } }),
    ContactMessage.countDocuments({ status: 'New' }),
    Invoice.aggregate([
      { $match: { status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, collected: { $sum: '$amountPaid' }, billed: { $sum: '$amount' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).select('reference customerName clinicName items totalAmount status createdAt').lean(),
    Quotation.find().sort({ createdAt: -1 }).limit(5).select('reference name clinicName product status createdAt').lean(),
    ServiceTicket.find({ status: { $in: OPEN_TICKETS } }).sort({ createdAt: -1 }).limit(5)
      .select('reference clinicName equipment issue priority status assignedEngineer').lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, value: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]),
    Product.find({ isActive: true, stock: { $gt: 0 }, ...LOW_STOCK_EXPR })
      .sort({ stock: 1 }).limit(8)
      .select('name slug stock lowStockThreshold reorderQuantity').lean(),
    Product.countDocuments({ isActive: true, stock: { $lte: 0 } }),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        customers,
        products,
        ordersTotal,
        ordersOpen,
        quotesNew,
        ticketsOpen,
        messagesNew,
        revenueCollected: revenueAgg[0]?.collected || 0,
        revenueBilled: revenueAgg[0]?.billed || 0,
        lowStock: lowStockItems.length,
        outOfStock: outOfStockCount,
      },
      recentOrders,
      recentQuotes,
      recentTickets,
      lowStockItems,
      last30Days: monthlyAgg,
    },
  });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { role: 'customer' };
  if (req.query.q) {
    const rx = containsRegex(req.query.q);
    filter.$or = [{ name: rx }, { email: rx }, { clinicName: rx }, { phone: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw ApiError.notFound('Customer not found');

  const [orders, quotations, tickets, invoices, messages] = await Promise.all([
    Order.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    Quotation.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    ServiceTicket.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    Invoice.find({ user: user._id }).sort({ issuedOn: -1 }).lean(),
    ContactMessage.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
  ]);

  res.json({ success: true, data: { user, orders, quotations, tickets, invoices, messages } });
});

export const setCustomerActive = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(req.body.isActive) },
    { new: true }
  );
  if (!user) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: user.toPublic() });
});

/**
 * Lets admin (support staff) update a customer's contact details on their
 * behalf - e.g. after a phone call asking to correct a clinic address.
 * Deliberately excludes email and password: those stay customer-controlled
 * so support can never silently take over a login.
 */
export const adminUpdateCustomer = asyncHandler(async (req, res) => {
  const { name, phone, clinicName, city, address } = req.body;
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (phone !== undefined) patch.phone = phone;
  if (clinicName !== undefined) patch.clinicName = clinicName;
  if (city !== undefined) patch.city = city;
  if (address !== undefined) patch.address = address;

  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('Customer not found');
  res.json({ success: true, data: user.toPublic() });
});
