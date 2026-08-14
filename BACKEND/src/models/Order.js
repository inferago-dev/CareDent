import mongoose from 'mongoose';

const ORDER_STATUSES = [
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

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, min: 1, default: 1 },
    unitPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    note: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },

    customerName: { type: String, required: true, trim: true },
    clinicName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    deliveryAddress: { type: String, trim: true },

    items: {
      type: [itemSchema],
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },
    totalAmount: { type: Number, min: 0, default: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: 'Pending Confirmation', index: true },
    timeline: [timelineSchema],

    expectedDelivery: { type: Date },
    deliveredAt: { type: Date },
    installationDate: { type: Date },
    assignedEngineer: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.pre('save', function computeTotal(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  }
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({ status: this.status, note: 'Order created' });
  }
  next();
});

export { ORDER_STATUSES };
export default mongoose.model('Order', orderSchema);
