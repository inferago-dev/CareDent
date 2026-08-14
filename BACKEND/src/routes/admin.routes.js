import { Router } from 'express';
import { adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import * as admin from '../controllers/admin.controller.js';
import * as product from '../controllers/product.controller.js';
import * as quotation from '../controllers/quotation.controller.js';
import * as order from '../controllers/order.controller.js';
import * as ticket from '../controllers/ticket.controller.js';
import * as invoice from '../controllers/invoice.controller.js';
import * as contact from '../controllers/contact.controller.js';
import * as document from '../controllers/document.controller.js';
import * as service from '../controllers/service.controller.js';
import * as inventory from '../controllers/inventory.controller.js';
import {
  productSchema, productUpdateSchema, quotationUpdateSchema, orderSchema,
  orderUpdateSchema, ticketUpdateSchema, invoiceSchema, invoicePaymentSchema,
  stockAdjustSchema,
} from '../validators/schemas.js';

const router = Router();
router.use(adminOnly);

/* dashboard */
router.get('/dashboard', admin.dashboard);

/* customers */
router.get('/customers', admin.listCustomers);
router.get('/customers/:id', admin.getCustomer);
router.patch('/customers/:id/active', admin.setCustomerActive);

/* products */
router.get('/products', product.adminListProducts);
router.post('/products', validate({ body: productSchema }), product.createProduct);
router.patch('/products/:id', validate({ body: productUpdateSchema }), product.updateProduct);
router.delete('/products/:id', product.deleteProduct);
router.post('/products/:id/images', upload.array('images', 8), product.uploadProductImages);

/* inventory & stock */
router.get('/inventory', inventory.listInventory);
router.patch('/inventory/:id', validate({ body: stockAdjustSchema }), inventory.adjustStock);

/* quotations */
router.get('/quotations', quotation.adminListQuotations);
router.get('/quotations/:id', quotation.adminGetQuotation);
router.patch('/quotations/:id', validate({ body: quotationUpdateSchema }), quotation.adminUpdateQuotation);
router.delete('/quotations/:id', quotation.adminDeleteQuotation);

/* orders */
router.get('/orders', order.adminListOrders);
router.get('/orders/:id', order.adminGetOrder);
router.post('/orders', validate({ body: orderSchema }), order.adminCreateOrder);
router.patch('/orders/:id', validate({ body: orderUpdateSchema }), order.adminUpdateOrder);
router.delete('/orders/:id', order.adminDeleteOrder);

/* service requests */
router.get('/service-requests', ticket.adminListTickets);
router.patch('/service-requests/:id', validate({ body: ticketUpdateSchema }), ticket.adminUpdateTicket);
router.delete('/service-requests/:id', ticket.adminDeleteTicket);

/* invoices */
router.get('/invoices', invoice.adminListInvoices);
router.post('/invoices', validate({ body: invoiceSchema }), invoice.adminCreateInvoice);
router.patch('/invoices/:id', invoice.adminUpdateInvoice);
router.post('/invoices/:id/payment', validate({ body: invoicePaymentSchema }), invoice.adminRecordPayment);
router.delete('/invoices/:id', invoice.adminDeleteInvoice);

/* contact messages */
router.get('/messages', contact.adminListMessages);
router.patch('/messages/:id', contact.adminUpdateMessage);
router.delete('/messages/:id', contact.adminDeleteMessage);

/* documents */
router.get('/documents', document.adminListDocuments);
router.post('/documents', upload.single('file'), document.adminUploadDocument);
router.delete('/documents/:id', document.adminDeleteDocument);

/* services / content */
router.put('/services', service.adminUpsertService);
router.delete('/services/:id', service.adminDeleteService);

export default router;
