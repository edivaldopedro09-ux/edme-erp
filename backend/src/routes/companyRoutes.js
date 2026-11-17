import express from 'express';
import { getMyCompanies, createCompany, renewCompanyPlan } from '../controllers/companyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyCompanies);
router.post('/', createCompany);
router.put('/:companyId/renew', renewCompanyPlan);

export default router;