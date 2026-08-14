import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { publicUrlFor } from '../middleware/upload.js';

const CATEGORY_ALIASES = {
  chairs: 'Dental Chairs',
  'dental-chairs': 'Dental Chairs',
  xray: 'Radiology',
  'x-ray': 'Radiology',
  radiology: 'Radiology',
  autoclaves: 'Sterilization',
  sterilization: 'Sterilization',
  compressors: 'Utility',
  utility: 'Utility',
  scalers: 'Prophylaxis',
  prophylaxis: 'Prophylaxis',
  curing: 'Restorative',
  restorative: 'Restorative',
  micromotors: 'Endodontics',
  endodontics: 'Endodontics',
  stools: 'Furniture',
  furniture: 'Furniture',
  accessories: 'Accessories',
};

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 60 });
  const { q, category, kind, featured } = req.query;

  const filter = { isActive: true };
  if (kind && ['chair', 'equipment'].includes(kind)) filter.kind = kind;
  if (featured === 'true') filter.isFeatured = true;

  if (category && category !== 'all') {
    const resolved = CATEGORY_ALIASES[String(category).toLowerCase()] || category;
    if (resolved === 'Dental Chairs') filter.kind = 'chair';
    else filter.category = new RegExp(`^${resolved}$`, 'i');
  }

  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { tagline: rx }, { category: rx }, { brand: rx }, { series: rx }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
  if (!product) throw ApiError.notFound('That product could not be found');

  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    kind: product.kind,
  })
    .sort({ sortOrder: 1 })
    .limit(3)
    .select('slug name tagline heroImage category badge')
    .lean();

  res.json({ success: true, data: product, related });
});

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, data: categories.sort() });
});

/* ------------------------- admin ------------------------- */

export const adminListProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 50 });
  const filter = {};
  if (req.query.q) filter.name = new RegExp(req.query.q, 'i');

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, meta: pageMeta(total, page, limit) });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ success: true, message: 'Product archived', data: product });
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  if (!req.files?.length) throw ApiError.badRequest('No files were uploaded');

  const urls = req.files.map(publicUrlFor);
  product.images.push(...urls);
  if (!product.heroImage) product.heroImage = urls[0];
  await product.save();

  res.status(201).json({ success: true, data: product, uploaded: urls });
});
