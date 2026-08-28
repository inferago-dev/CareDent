import { z } from 'zod';
import {
  ORDER_STATUSES, TICKET_STATUSES, SERVICE_TYPES, PRIORITIES, QUOTATION_STATUSES,
  INVOICE_STATUSES, PAYMENT_METHODS, MESSAGE_STATUSES, PRODUCT_KINDS,
} from '../constants/domain.js';

// zod wants a non-empty tuple; the domain lists are plain arrays.
const oneOf = (values) => z.enum(values);

const trimmed = (min, max, label) =>
  z.string({ error: `${label} is required` }).trim().min(min, `${label} is required`).max(max, `${label} is too long`);

export const email = z.string().trim().toLowerCase().email('Enter a valid email address');
export const phone = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number')
  .max(20, 'Enter a valid phone number')
  .regex(/^[+\d][\d\s\-()]*$/, 'Enter a valid phone number');

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

/**
 * Public tracking reference (ORD-000001, TKT-000001, CD-QT-000001). Bounded
 * and character-restricted so the lookup can never be handed a 10 KB string or
 * anything that is not a reference in the first place.
 */
export const referenceParamSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Enter the reference from your confirmation')
    .max(40, 'That does not look like a Care Dent reference')
    .regex(/^[A-Z0-9-]+$/, 'That does not look like a Care Dent reference'),
});

/** `:id` on every admin detail route. */
export const idParamSchema = z.object({ id: objectId });

/* ---------------- auth ---------------- */
export const registerSchema = z.object({
  name: trimmed(2, 120, 'Name'),
  email,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone: phone.optional(),
  clinicName: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(400).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const updateMeSchema = z.object({
  name: trimmed(2, 120, 'Name').optional(),
  phone: phone.optional(),
  clinicName: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(400).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

/* ---------------- quotation ---------------- */
export const quotationSchema = z.object({
  name: trimmed(2, 120, 'Name'),
  clinicName: z.string().trim().max(160).optional().or(z.literal('')),
  phone,
  email,
  address: z.string().trim().max(400).optional().or(z.literal('')),
  product: trimmed(1, 200, 'Product'),
  productRef: objectId.optional(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const quotationUpdateSchema = z.object({
  status: oneOf(QUOTATION_STATUSES).optional(),
  quotedAmount: z.coerce.number().min(0).optional(),
  validTill: z.coerce.date().optional(),
  adminNotes: z.string().trim().max(2000).optional(),
});

/* ---------------- admin reply (contact + quotation) ---------------- */
export const replySchema = z.object({
  message: trimmed(2, 4000, 'Reply'),
});

/* ---------------- contact ---------------- */
export const contactSchema = z.object({
  name: trimmed(2, 120, 'Name'),
  email,
  phone: phone.optional().or(z.literal('')),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  message: trimmed(5, 4000, 'Message'),
});

/* ---------------- service ticket ---------------- */
export const ticketSchema = z.object({
  clinicName: z.string().trim().max(160).optional().or(z.literal('')),
  contactName: trimmed(2, 120, 'Name'),
  phone,
  email: email.optional().or(z.literal('')),
  address: z.string().trim().max(400).optional().or(z.literal('')),
  equipment: trimmed(2, 200, 'Equipment'),
  serialNumber: z.string().trim().max(80).optional().or(z.literal('')),
  serviceType: oneOf(SERVICE_TYPES).default('Breakdown Repair'),
  issue: trimmed(5, 2000, 'Issue description'),
  priority: oneOf(PRIORITIES).default('Medium'),
});

/* ---------------- pre-installation site assessment ---------------- */
// Sent as multipart/form-data (the clinic attaches a floor plan), so every
// field arrives as a string - hence the tolerant shapes below.
export const siteAssessmentSchema = z.object({
  clinicName: trimmed(2, 160, 'Clinic name'),
  contactName: trimmed(2, 120, 'Contact person'),
  phone,
  email: email.optional().or(z.literal('')),
  location: trimmed(3, 400, 'Site location'),
  equipment: trimmed(2, 400, 'Equipment required'),
  roomLength: z.string().trim().max(30).optional().or(z.literal('')),
  roomWidth: z.string().trim().max(30).optional().or(z.literal('')),
  ceilingHeight: z.string().trim().max(30).optional().or(z.literal('')),
  preferredDate: z.coerce.date().optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const ticketUpdateSchema = z.object({
  status: oneOf(TICKET_STATUSES).optional(),
  priority: oneOf(PRIORITIES).optional(),
  assignedEngineer: z.string().trim().max(120).optional(),
  scheduledFor: z.coerce.date().optional(),
  resolutionNotes: z.string().trim().max(2000).optional(),
  note: z.string().trim().max(500).optional(),
});

/* ---------------- product ---------------- */
export const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, 'Slug can only use lowercase letters, numbers and dashes'),
  name: trimmed(2, 160, 'Name'),
  tagline: z.string().trim().max(200).optional().or(z.literal('')),
  kind: oneOf(PRODUCT_KINDS),
  category: trimmed(2, 80, 'Category'),
  series: z.string().trim().max(80).optional().or(z.literal('')),
  brand: z.string().trim().max(80).optional().or(z.literal('')),
  badge: z.string().trim().max(60).optional().or(z.literal('')),
  description: trimmed(10, 4000, 'Description'),
  heroImage: z.string().trim().optional().or(z.literal('')),
  images: z.array(z.string().trim()).max(12).optional(),
  keyDifferentiators: z.array(z.string().trim().max(300)).max(20).optional(),
  specifications: z.array(z.object({ label: z.string().trim().min(1), value: z.string().trim().min(1) })).max(40).optional(),
  brochureUrl: z.string().trim().optional().or(z.literal('')),
  price: z.coerce.number().min(0).optional(),
  priceOnRequest: z.coerce.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const productUpdateSchema = productSchema.partial();

/* ---------------- order ---------------- */
export const orderSchema = z.object({
  user: objectId.optional(),
  quotation: objectId.optional(),
  customerName: trimmed(2, 120, 'Customer name'),
  clinicName: z.string().trim().max(160).optional().or(z.literal('')),
  phone,
  email: email.optional().or(z.literal('')),
  deliveryAddress: z.string().trim().max(400).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        product: objectId.optional(),
        name: trimmed(1, 200, 'Item name'),
        quantity: z.coerce.number().int().min(1).default(1),
        unitPrice: z.coerce.number().min(0).default(0),
      })
    )
    .min(1, 'Add at least one item'),
  expectedDelivery: z.coerce.date().optional(),
  assignedEngineer: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const orderUpdateSchema = z.object({
  status: oneOf(ORDER_STATUSES).optional(),
  note: z.string().trim().max(500).optional(),
  expectedDelivery: z.coerce.date().optional(),
  installationDate: z.coerce.date().optional(),
  assignedEngineer: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
});

/* ---------------- invoice ---------------- */
export const invoiceSchema = z.object({
  user: objectId.optional(),
  order: objectId.optional(),
  customerName: trimmed(2, 120, 'Customer name'),
  clinicName: z.string().trim().max(160).optional().or(z.literal('')),
  description: z.string().trim().max(400).optional().or(z.literal('')),
  lines: z
    .array(
      z.object({
        description: trimmed(1, 300, 'Description'),
        quantity: z.coerce.number().int().min(1).default(1),
        unitPrice: z.coerce.number().min(0).default(0),
      })
    )
    .min(1, 'Add at least one line item'),
  taxPercent: z.coerce.number().min(0).max(100).default(18),
  dueOn: z.coerce.date().optional(),
});

export const invoicePaymentSchema = z.object({
  amountPaid: z.coerce.number().min(0),
  paymentMethod: oneOf(PAYMENT_METHODS).optional(),
});

/* ---------------- inventory ---------------- */
export const stockAdjustSchema = z
  .object({
    delta: z.coerce.number().int().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    lowStockThreshold: z.coerce.number().int().min(0).optional(),
    reorderQuantity: z.coerce.number().int().min(0).optional(),
    note: z.string().trim().max(200).optional(),
  })
  .refine(
    (v) => v.delta !== undefined || v.stock !== undefined ||
           v.lowStockThreshold !== undefined || v.reorderQuantity !== undefined,
    { message: 'Send a delta, an absolute stock count, or a threshold to update' }
  );

/* ---------------- admin: routes that previously took an unchecked body ---------------- */

/**
 * Invoice edits. Deliberately narrow: `reference`, `subtotal`, `taxAmount` and
 * `amount` are derived or immutable, and the update handler assigns whatever it
 * is given straight onto the document - so anything not listed here is a field
 * an admin could silently corrupt by typo or a stray key could overwrite.
 * Payments go through POST /invoices/:id/payment, not this route.
 */
export const invoiceUpdateSchema = z.object({
  customerName: trimmed(2, 120, 'Customer name').optional(),
  clinicName: z.string().trim().max(160).optional().or(z.literal('')),
  description: z.string().trim().max(400).optional().or(z.literal('')),
  lines: z
    .array(
      z.object({
        description: trimmed(1, 300, 'Description'),
        quantity: z.coerce.number().int().min(1).default(1),
        unitPrice: z.coerce.number().min(0).default(0),
      })
    )
    .min(1, 'Add at least one line item')
    .optional(),
  taxPercent: z.coerce.number().min(0).max(100).optional(),
  status: oneOf(INVOICE_STATUSES).optional(),
  dueOn: z.coerce.date().optional(),
  paymentMethod: oneOf(PAYMENT_METHODS).optional(),
});

export const messageUpdateSchema = z.object({
  status: oneOf(MESSAGE_STATUSES).optional(),
  adminNotes: z.string().trim().max(2000).optional(),
});

export const customerActiveSchema = z.object({
  isActive: z.coerce.boolean(),
});

export const serviceUpsertSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'A service needs a key')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Key can only use lowercase letters, numbers and dashes'),
  title: trimmed(2, 120, 'Title'),
  iconName: z.string().trim().max(40).optional(),
  description: trimmed(10, 2000, 'Description'),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});
