import mongoose from 'mongoose';
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../constants/domain.js';

const lineSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, min: 1, default: 1 },
    unitPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    customerName: { type: String, required: true, trim: true },
    clinicName: { type: String, trim: true },
    description: { type: String, trim: true },
    lines: [lineSchema],

    subtotal: { type: Number, min: 0, default: 0 },
    taxPercent: { type: Number, min: 0, max: 100, default: 18 },
    taxAmount: { type: Number, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
    amountPaid: { type: Number, min: 0, default: 0 },

    status: { type: String, enum: INVOICE_STATUSES, default: 'Draft', index: true },
    issuedOn: { type: Date, default: Date.now },
    dueOn: { type: Date },
    paidOn: { type: Date },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function computeTotals(next) {
  if (this.lines?.length) {
    this.subtotal = this.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  }
  this.taxAmount = Math.round((this.subtotal * this.taxPercent) / 100);
  this.amount = this.subtotal + this.taxAmount;
  if (this.amountPaid >= this.amount && this.amount > 0) {
    this.status = 'Paid';
    if (!this.paidOn) this.paidOn = new Date();
  } else if (this.amountPaid > 0) {
    this.status = 'Partially Paid';
  }
  next();
});

export default mongoose.model('Invoice', invoiceSchema);
