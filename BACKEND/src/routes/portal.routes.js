import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as portal from '../controllers/portal.controller.js';
import * as order from '../controllers/order.controller.js';
import * as quotation from '../controllers/quotation.controller.js';
import * as ticket from '../controllers/ticket.controller.js';
import * as invoice from '../controllers/invoice.controller.js';
import * as document from '../controllers/document.controller.js';

const router = Router();
router.use(protect);

router.get('/overview', portal.overview);
router.get('/orders', order.myOrders);
router.get('/orders/:id', order.myOrder);
router.get('/quotations', quotation.myQuotations);
router.get('/service-requests', ticket.myTickets);
router.get('/invoices', invoice.myInvoices);
router.get('/documents', document.myDocuments);

export default router;
