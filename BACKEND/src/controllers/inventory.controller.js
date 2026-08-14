import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendMail, detailsTable } from '../utils/mailer.js';

/** A product is "low" when it is at or below its own threshold but not yet out. */
export const LOW_STOCK_EXPR = {
  $expr: { $lte: ['$stock', '$lowStockThreshold'] },
};

export const listInventory = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.q) filter.name = new RegExp(req.query.q, 'i');
  if (req.query.state === 'low') Object.assign(filter, LOW_STOCK_EXPR, { stock: { $gt: 0 } });
  if (req.query.state === 'out') filter.stock = { $lte: 0 };

  const items = await Product.find(filter)
    .sort({ stock: 1, sortOrder: 1 })
    .select('slug name kind category brand stock lowStockThreshold reorderQuantity price heroImage updatedAt')
    .lean();

  const all = await Product.find({ isActive: true }).select('stock lowStockThreshold price').lean();
  const summary = {
    skus: all.length,
    unitsOnHand: all.reduce((s, p) => s + (p.stock || 0), 0),
    outOfStock: all.filter((p) => (p.stock || 0) <= 0).length,
    lowStock: all.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold ?? 2)).length,
    stockValue: all.reduce((s, p) => s + (p.stock || 0) * (p.price || 0), 0),
  };

  res.json({ success: true, data: items, summary });
});

/**
 * Adjust stock. Send `delta` to add/remove relative to current level (goods
 * received, damage, manual correction), or `stock` to set an absolute count
 * after a physical count.
 */
export const adjustStock = asyncHandler(async (req, res) => {
  const { delta, stock, lowStockThreshold, reorderQuantity, note } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (delta !== undefined) {
    const next = product.stock + Number(delta);
    if (next < 0) throw ApiError.badRequest(`Only ${product.stock} in stock — cannot remove ${Math.abs(delta)}.`);
    product.stock = next;
  } else if (stock !== undefined) {
    product.stock = Number(stock);
  }

  if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
  if (reorderQuantity !== undefined) product.reorderQuantity = Number(reorderQuantity);

  product.stockUpdatedAt = new Date();
  if (note) product.stockNote = note;
  await product.save();

  res.json({ success: true, data: product });
});

/**
 * Moves stock when an order is confirmed, and puts it back if that order is
 * later cancelled. `stockDeducted` on the order makes this idempotent, so
 * flipping a status back and forth can never double-count.
 */
export async function applyStockForOrder(order, previousStatus) {
  const DEDUCT_AT = ['Confirmed', 'Processing', 'Pending Dispatch', 'Dispatched', 'Installation Scheduled', 'Delivered', 'Completed'];
  const shouldHold = DEDUCT_AT.includes(order.status);
  const isCancelled = order.status === 'Cancelled';

  if (shouldHold && !order.stockDeducted) {
    for (const item of order.items) {
      if (!item.product) continue;
      await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
    }
    order.stockDeducted = true;
    await notifyLowStock(order.items.map((i) => i.product).filter(Boolean));
  } else if (isCancelled && order.stockDeducted) {
    for (const item of order.items) {
      if (!item.product) continue;
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }
    order.stockDeducted = false;
  }

  return order;
}

/** Emails the office once a confirmed order drops something to or below its threshold. */
async function notifyLowStock(productIds) {
  if (!productIds.length) return;
  const ids = productIds.filter((id) => mongoose.isValidObjectId(id));
  if (!ids.length) return;

  const low = await Product.find({ _id: { $in: ids }, ...LOW_STOCK_EXPR }).select('name stock lowStockThreshold reorderQuantity').lean();
  if (!low.length) return;

  sendMail({
    subject: `Low stock: ${low.map((p) => p.name).join(', ')}`,
    html: detailsTable(
      'Stock running low',
      low.map((p) => [p.name, `${p.stock} left (reorder at ${p.lowStockThreshold}, suggested order ${p.reorderQuantity || 1})`])
    ),
  }).catch(() => {});
}
