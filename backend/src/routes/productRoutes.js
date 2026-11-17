import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { verifyCompanyAccess } from '../middlewares/tenantMiddleware.js';

const router = express.Router();

// Todas as rotas exigem autenticação e validação da empresa ativa (com verificação de plano)
router.use(protect, verifyCompanyAccess);

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;