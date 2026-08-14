import Document from '../models/Document.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { publicUrlFor } from '../middleware/upload.js';

export const myDocuments = asyncHandler(async (req, res) => {
  const docs = await Document.find({ $or: [{ user: req.user._id }, { isPublic: true }] })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: docs });
});

export const publicDocuments = asyncHandler(async (_req, res) => {
  const docs = await Document.find({ isPublic: true }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: docs });
});

export const adminUploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file was uploaded');

  const doc = await Document.create({
    title: req.body.title || req.file.originalname,
    category: req.body.category || 'Other',
    fileUrl: publicUrlFor(req.file),
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    user: req.body.user || undefined,
    product: req.body.product || undefined,
    isPublic: String(req.body.isPublic) === 'true',
  });

  res.status(201).json({ success: true, data: doc });
});

export const adminListDocuments = asyncHandler(async (_req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 }).populate('user', 'name email').lean();
  res.json({ success: true, data: docs });
});

export const adminDeleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound('Document not found');
  res.json({ success: true, message: 'Document deleted' });
});
