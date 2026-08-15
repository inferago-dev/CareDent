import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    // Contact snapshot (kept even for guests who never register)
    name: { type: String, required: [true, 'Name is required'], trim: true },
    clinicName: { type: String, trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
    address: { type: String, trim: true },

    product: { type: String, required: [true, 'Select a product'], trim: true },
    productRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, min: 1, default: 1 },
    notes: { type: String, trim: true, maxlength: 2000 },

    status: {
      type: String,
      enum: ['New', 'In Review', 'Quoted', 'Approved', 'Rejected', 'Expired'],
      default: 'New',
      index: true,
    },
    quotedAmount: { type: Number, min: 0 },
    validTill: { type: Date },
    adminNotes: { type: String, trim: true },
    adminReply: {
      message: { type: String, trim: true, maxlength: 4000 },
      sentAt: { type: Date },
    },
    source: { type: String, enum: ['website', 'phone', 'walk-in', 'referral'], default: 'website' },
  },
  { timestamps: true }
);

export default mongoose.model('Quotation', quotationSchema);
