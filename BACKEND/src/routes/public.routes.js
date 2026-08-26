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
import { upload } from '../middleware/upload.js';
import { quotationSchema, contactSchema, ticketSchema, siteAssessmentSchema, referenceParamSchema } from '../validators/schemas.js';

const router = Router();

// Public forms are the obvious spam target - keep them tightly limited.
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'You have sent several requests already. Please call us on +91 94441 53599.' },
});

/**
 * References are a sequential counter (ORD-000001, ORD-000002, ...), so anyone
 * who has one can walk the series and read every other customer's order status,
 * equipment list and engineer. The endpoints have to stay open - customers
 * track without an account - so the guard is a rate limit tight enough that
 * enumeration is not worth the wait, but loose enough that nobody checking
 * their own delivery ever notices it.
 */
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many lookups. Please wait a few minutes, or call us on +91 94441 53599.' },
});

router.get('/services', service.listServices);
router.get('/documents', document.publicDocuments);

router.post('/quotations', formLimiter, optionalAuth, validate({ body: quotationSchema }), quotation.createQuotation);
router.get('/quotations/track/:reference', trackLimiter, validate({ params: referenceParamSchema }), quotation.trackQuotation);

router.post('/contact', formLimiter, optionalAuth, validate({ body: contactSchema }), contact.createMessage);

router.post('/service-requests', formLimiter, optionalAuth, validate({ body: ticketSchema }), ticket.createTicket);

// multipart/form-data: the clinic attaches a floor plan or room photos.
router.post(
  '/site-assessments',
  formLimiter,
  optionalAuth,
  upload.array('attachments', 6),
  validate({ body: siteAssessmentSchema }),
  ticket.createSiteAssessment
);
router.get('/service-requests/track/:reference', trackLimiter, validate({ params: referenceParamSchema }), ticket.trackTicket);

router.get('/orders/track/:reference', trackLimiter, validate({ params: referenceParamSchema }), order.trackOrder);

export default router;
