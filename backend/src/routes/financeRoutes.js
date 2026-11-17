import express from 'express';
import { 
  getBankAccounts, 
  createBankAccount, 
  registerCashMovement, 
  getJournalEntries, 
  createJournalEntry 
} from '../controllers/financeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyCompanyAccess } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.use(protect, verifyCompanyAccess);

// Tesouraria e Bancos
router.get('/banks', getBankAccounts);
router.post('/banks', createBankAccount);
router.post('/movements', registerCashMovement);

// Contabilidade Geral
router.get('/journal', getJournalEntries);
router.post('/journal', createJournalEntry);

export default router;