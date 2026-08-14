import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, updateMeSchema, changePasswordSchema } from '../validators/schemas.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/register', authLimiter, validate({ body: registerSchema }), c.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), c.login);
router.post('/logout', c.logout);

router.get('/me', protect, c.me);
router.patch('/me', protect, validate({ body: updateMeSchema }), c.updateMe);
router.patch('/me/password', protect, validate({ body: changePasswordSchema }), c.changePassword);

export default router;
