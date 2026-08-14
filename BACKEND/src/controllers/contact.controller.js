import ContactMessage from '../models/ContactMessage.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { sendMail, detailsTable } from '../utils/mailer.js';

export const createMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create(req.body);

  sendMail({
    subject: `Website enquiry from ${message.name}`,
    replyTo: message.email,
    html: detailsTable('New Website Enquiry', [
      ['Name', message.name],
      ['Email', message.email],
      ['Phone', message.phone],
      ['Subject', message.subject],
      ['Message', message.message],
    ]),
  }).catch(() => {});

  res.status(201).json({ success: true, message: 'Thanks - we will get back to you shortly.', data: { id: message._id } });
});

export const adminListMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const adminUpdateMessage = asyncHandler(async (req, res) => {
  const patch = { ...req.body };
  if (patch.status === 'Replied') patch.repliedAt = new Date();

  const message = await ContactMessage.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, data: message });
});

export const adminDeleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, message: 'Message deleted' });
});
