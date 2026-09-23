import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parsePaging, pageMeta } from '../utils/pagination.js';
import { publicUrlFor } from '../middleware/upload.js';
import { containsRegex, exactRegex } from '../utils/escapeRegex.js';

/**
 * The slugs the site uses in `?category=` mapped to the filter they mean.
 *
 * Two of them are not categories at all: "chairs" and "equipment" are the
 * catalogue's top-level split and live on `kind`. Resolving them to a category
 * name instead is why the Equipment tab used to come back empty - no product
 * has a category literally called "equipment".
 */
const CATEGORY_ALIASES = {
  chairs: { kind: 'chair' },
  'dental-chairs': { kind: 'chair' },
  equipment: { kind: 'equipment' },
  xray: { category: 'Radiology' },
  'x-ray': { category: 'Radiology' },
  radiology: { category: 'Radiology' },
  autoclaves: { category: 'Sterilization' },
  sterilization: { category: 'Sterilization' },
  compressors: { category: 'Utility' },
  utility: { category: 'Utility' },
  scalers: { category: 'Prophylaxis' },
  prophylaxis: { category: 'Prophylaxis' },
  curing: { category: 'Restorative' },
  restorative: { category: 'Restorative' },
  micromotors: { category: 'Endodontics' },
  endodontics: { category: 'Endodontics' },
  stools: { category: 'Furniture' },
  furniture: { category: 'Furniture' },
  accessories: { category: 'Accessories' },
};

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 60 });
  const { q, category, kind, featured } = req.query;

  const filter = { isActive: true };
  if (kind && ['chair', 'equipment'].includes(kind)) filter.kind = kind;
  if (featured === 'true') filter.isFeatured = true;

  if (category && category !== 'all') {
    const alias = CATEGORY_ALIASES[String(category).toLowerCase()];
    if (alias?.kind) filter.kind = alias.kind;
    else filter.category = exactRegex(alias?.category ?? category);
  }

  if (q) {
    const rx = containsRegex(q);
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
  if (req.query.q) filter.name = containsRegex(req.query.q);

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
