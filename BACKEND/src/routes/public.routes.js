import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as quotation from '../controllers/quotation.controller.js';
import * as contact from '../controllers/contact.controller.js';
import * as ticket from '../controllers/ticket.controller.js';
import * as order from '../controllers/order.controller.js';
import * as service from '../controllers/service.controller.js';
import * as document from '../controllers/document.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { quotationSchema, contactSchema, ticketSchema } from '../validators/schemas.js';

const router = Router();

// Public forms are the obvious spam target - keep them tightly limited.
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'You have sent several requests already. Please call us on +91 94441 53599.' },
});

router.get('/services', service.listServices);
router.get('/documents', document.publicDocuments);

router.post('/quotations', formLimiter, optionalAuth, validate({ body: quotationSchema }), quotation.createQuotation);
router.get('/quotations/track/:reference', quotation.trackQuotation);

router.post('/contact', formLimiter, validate({ body: contactSchema }), contact.createMessage);

router.post('/service-requests', formLimiter, optionalAuth, validate({ body: ticketSchema }), ticket.createTicket);
router.get('/service-requests/track/:reference', ticket.trackTicket);

router.get('/orders/track/:reference', order.trackOrder);

export default router;
