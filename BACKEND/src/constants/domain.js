/**
 * The vocabulary of the business, in one place.
 *
 * Each of these lists used to be written out twice on the server - once as a
 * Mongoose enum and once as a zod enum - and a third time in the admin UI.
 * Adding a status meant finding three copies, and missing one failed silently:
 * the model would accept a value the validator rejected, or the admin would
 * offer a status the API refused to store.
 *
 * The frontend has its own copy in FRONTEND/src/lib/domain.js, because the two
 * packages ship separately. That file is the only place it is duplicated, and
 * it says so.
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

/** Order states in which stock is considered committed to the customer. */
export const STOCK_COMMITTED_STATUSES = [
  'Confirmed',
  'Processing',
  'Pending Dispatch',
  'Dispatched',
  'Installation Scheduled',
  'Delivered',
  'Completed',
];

/** Orders still in flight, for dashboard counts. */
export const OPEN_ORDER_STATUSES = [
  'Pending Confirmation',
  'Confirmed',
  'Processing',
  'Pending Dispatch',
  'Dispatched',
  'Installation Scheduled',
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

/** Tickets still needing attention, for dashboard counts. */
export const OPEN_TICKET_STATUSES = [
  'Open',
  'Acknowledged',
  'Engineer Assigned',
  'Pending Parts',
  'In Progress',
];

export const SERVICE_TYPES = [
  'Pre-Installation Site Visit',
  'Installation',
  'Routine Maintenance',
  'Breakdown Repair',
  'Inspection',
  'Remote Support',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const QUOTATION_STATUSES = ['New', 'In Review', 'Quoted', 'Approved', 'Rejected', 'Expired'];

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'];

export const MESSAGE_STATUSES = ['New', 'Read', 'Replied', 'Archived'];

export const DOCUMENT_CATEGORIES = ['Manual', 'Warranty', 'Brochure', 'Invoice', 'Certificate', 'Other'];

export const PRODUCT_KINDS = ['chair', 'equipment'];

export const USER_ROLES = ['customer', 'admin'];

export const QUOTATION_SOURCES = ['website', 'phone', 'walk-in', 'referral'];
