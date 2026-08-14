import mongoose from 'mongoose';

const specSchema = new mongoose.Schema(
  { label: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    kind: { type: String, enum: ['chair', 'equipment'], required: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    series: { type: String, trim: true },
    brand: { type: String, trim: true },
    badge: { type: String, trim: true },
    description: { type: String, required: true },
    heroImage: { type: String },
    images: [{ type: String }],
    keyDifferentiators: [{ type: String }],
    specifications: [specSchema],
    brochureUrl: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, min: 0, default: 0 },
    priceOnRequest: { type: Boolean, default: true },
    price: { type: Number, min: 0 },
    stock: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 2 },
    reorderQuantity: { type: Number, min: 0, default: 5 },
    stockUpdatedAt: { type: Date },
    stockNote: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tagline: 'text', category: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
