import ContactMessage from '../models/ContactMessage.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { sendMail, detailsTable, replyEmail } from '../utils/mailer.js';

export const createMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create({ ...req.body, user: req.user?._id });

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

/**
 * Sends the admin's free-text reply to the customer's inbox. There's no
 * live chat yet, so every reply doubles as a heads-up that a Care Dent
 * rep will also call at a convenient time to go over details.
 */
export const adminReplyMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) throw ApiError.notFound('Message not found');

  message.adminReply = { message: req.body.message, sentAt: new Date() };
  message.status = 'Replied';
  message.repliedAt = new Date();
  await message.save();

  const mail = await sendMail({
    to: message.email,
    subject: `Re: ${message.subject || 'Your enquiry'} - Care Dent`,
    html: replyEmail({
      heading: 'Reply to your enquiry',
      intro: `Hi ${message.name}, thanks for reaching out to Care Dent. Here's our reply:`,
      replyMessage: req.body.message,
      footerNote: 'A Care Dent representative will also call you at a convenient time to go over this in more detail.',
    }),
  });

  res.json({ success: true, data: message, mail });
});

export const adminDeleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, message: 'Message deleted' });
});
