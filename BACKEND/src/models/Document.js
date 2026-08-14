import mongoose from 'mongoose';

// Manuals, warranty certificates and other files exposed in the customer portal.
const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Manual', 'Warranty', 'Brochure', 'Invoice', 'Certificate', 'Other'],
      default: 'Other',
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    isPublic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
