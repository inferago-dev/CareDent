/**
 * The vocabulary of the business, as the UI needs it.
 *
 * This mirrors BACKEND/src/constants/domain.js. The two packages ship and
 * deploy separately, so the frontend cannot import from the server — this is
 * the one place the lists are duplicated, and it is deliberate rather than
 * accidental. Keep them in step: the API rejects anything not in its own copy,
 * so a status added only here becomes a dropdown option that fails on save.
 *
 * Statuses are ordered as the work actually progresses, which is also the order
 * the admin dropdowns present them in.
 */

export const ORDER_STATUSES = [
  'Pending Confirmation',
  'Confirmed',
  'Processing',
  'Pending Dispatch',
  'Dispatched',
  'Installation Scheduled',
  'Delivered',
  'Completed',
  'Cancelled',
];

export const TICKET_STATUSES = [
  'Open',
  'Acknowledged',
  'Engineer Assigned',
  'Pending Parts',
  'In Progress',
  'Resolved',
  'Closed',
  'Cancelled',
];

export const QUOTATION_STATUSES = ['New', 'In Review', 'Quoted', 'Approved', 'Rejected', 'Expired'];

export const SERVICE_TYPES = [
  'Breakdown Repair',
  'Routine Maintenance',
  'Pre-Installation Site Visit',
  'Installation',
  'Inspection',
  'Remote Support',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'];

export const MESSAGE_STATUSES = ['New', 'Read', 'Replied', 'Archived'];

export const DOCUMENT_CATEGORIES = ['Manual', 'Warranty', 'Brochure', 'Invoice', 'Certificate', 'Other'];
