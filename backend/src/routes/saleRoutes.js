import express from 'express';
import { getSales, createSale } from '../controllers/saleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyCompanyAccess } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.use(protect, verifyCompanyAccess);

router.get('/', getSales);
router.post('/', createSale);

export default router;