import ServiceTicket from '../models/ServiceTicket.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { nextReference } from '../utils/reference.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { sendMail, detailsTable } from '../utils/mailer.js';

export const createTicket = asyncHandler(async (req, res) => {
  const reference = await nextReference('ticket', 'TKT-');
  const ticket = await ServiceTicket.create({ ...req.body, reference, user: req.user?._id });

  sendMail({
    subject: `[${ticket.priority}] Service request ${reference} - ${ticket.equipment}`,
    replyTo: ticket.email || undefined,
    html: detailsTable('New Service Request', [
      ['Reference', reference],
      ['Priority', ticket.priority],
      ['Type', ticket.serviceType],
      ['Equipment', ticket.equipment],
      ['Serial no.', ticket.serialNumber],
      ['Issue', ticket.issue],
      ['Clinic', ticket.clinicName],
      ['Contact', ticket.contactName],
      ['Phone', ticket.phone],
      ['Email', ticket.email],
      ['Address', ticket.address],
    ]),
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Service request logged',
    data: { reference: ticket.reference, id: ticket._id },
  });
});

export const trackTicket = asyncHandler(async (req, res) => {
  const ticket = await ServiceTicket.findOne({ reference: req.params.reference.toUpperCase() })
    .select('reference equipment status priority updates scheduledFor assignedEngineer createdAt')
    .lean();
  if (!ticket) throw ApiError.notFound('No service request found with that reference');
  res.json({ success: true, data: ticket });
});

export const myTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { user: req.user._id };

  const [items, total] = await Promise.all([
    ServiceTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ServiceTicket.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

/* ------------------------- admin ------------------------- */

export const adminListTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.q) {
    const rx = new RegExp(req.query.q, 'i');
    filter.$or = [{ reference: rx }, { clinicName: rx }, { contactName: rx }, { equipment: rx }];
  }

  const [items, total] = await Promise.all([
    ServiceTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').lean(),
    ServiceTicket.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const adminUpdateTicket = asyncHandler(async (req, res) => {
  const ticket = await ServiceTicket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('Service request not found');

  const { status, note, ...rest } = req.body;
  Object.assign(ticket, rest);

  if (status && status !== ticket.status) {
    ticket.status = status;
    ticket.updates.push({ status, note: note || `Status changed to ${status}`, by: req.user.name });
    if (status === 'Resolved') ticket.resolvedAt = new Date();
  } else if (note) {
    ticket.updates.push({ status: ticket.status, note, by: req.user.name });
  }

  await ticket.save();
  res.json({ success: true, data: ticket });
});

export const adminDeleteTicket = asyncHandler(async (req, res) => {
  const ticket = await ServiceTicket.findByIdAndDelete(req.params.id);
  if (!ticket) throw ApiError.notFound('Service request not found');
  res.json({ success: true, message: 'Service request deleted' });
});
