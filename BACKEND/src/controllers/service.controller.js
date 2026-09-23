import Service from '../models/Service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listServices = asyncHandler(async (_req, res) => {
  const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  res.json({ success: true, data: services });
});

export const adminUpsertService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate({ key: req.body.key }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  res.json({ success: true, data: service });
});

export const adminDeleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw ApiError.notFound('Service not found');
  res.json({ success: true, message: 'Service deleted' });
});
