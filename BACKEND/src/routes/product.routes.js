import { Router } from 'express';
import * as c from '../controllers/product.controller.js';

const router = Router();

router.get('/', c.listProducts);
router.get('/categories', c.listCategories);
router.get('/:slug', c.getProduct);

export default router;
