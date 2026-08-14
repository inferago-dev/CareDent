import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import ServiceTicket from '../models/ServiceTicket.js';
import Invoice from '../models/Invoice.js';
import ContactMessage from '../models/ContactMessage.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';

const OPEN_TICKETS = ['Open', 'Acknowledged', 'Engineer Assigned', 'Pending Parts', 'In Progress'];
const OPEN_ORDERS = ['Pending Confirmation', 'Confirmed', 'Processing', 'Pending Dispatch', 'Dispatched', 'Installation Scheduled'];

export const dashboard = asyncHandler(async (_req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    customers, products, ordersTotal, ordersOpen,
    quotesNew, ticketsOpen, messagesNew,
    revenueAgg, recentOrders, recentQuotes, recentTickets, monthlyAgg,
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
      },
      recentOrders,
      recentQuotes,
      recentTickets,
      last30Days: monthlyAgg,
    },
  });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { role: 'customer' };
  if (req.query.q) {
    const rx = new RegExp(req.query.q, 'i');
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

  const [orders, quotations, tickets, invoices] = await Promise.all([
    Order.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    Quotation.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    ServiceTicket.find({ user: user._id }).sort({ createdAt: -1 }).lean(),
    Invoice.find({ user: user._id }).sort({ issuedOn: -1 }).lean(),
  ]);

  res.json({ success: true, data: { user, orders, quotations, tickets, invoices } });
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
