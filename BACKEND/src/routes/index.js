import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import publicRoutes from './public.routes.js';
import portalRoutes from './portal.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, service: 'caredent-api', time: new Date().toISOString() })
);

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/portal', portalRoutes);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);

export default router;
