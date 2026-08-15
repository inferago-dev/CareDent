import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import ServiceTicket from '../models/ServiceTicket.js';
import Invoice from '../models/Invoice.js';
import Document from '../models/Document.js';
import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Single call that powers the whole customer portal, so the UI does not waterfall. */
export const overview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [orders, quotations, tickets, invoices, documents, messages] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Quotation.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
    ServiceTicket.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Invoice.find({ user: userId, status: { $ne: 'Draft' } }).sort({ issuedOn: -1 }).limit(50).lean(),
    Document.find({ $or: [{ user: userId }, { isPublic: true }] }).sort({ createdAt: -1 }).limit(50).lean(),
    ContactMessage.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  const outstanding = invoices
    .filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled')
    .reduce((sum, i) => sum + (i.amount - i.amountPaid), 0);

  res.json({
    success: true,
    data: {
      user: req.user.toPublic(),
      stats: {
        orders: orders.length,
        activeQuotes: quotations.filter((q) => ['New', 'In Review', 'Quoted'].includes(q.status)).length,
        openTickets: tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status)).length,
        outstanding,
      },
      orders,
      quotations,
      tickets,
      invoices,
      documents,
      messages,
    },
  });
});
