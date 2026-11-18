import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Ajuste o caminho se o seu middleware tiver outro nome ou localização

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Nova rota essencial para o modelo SaaS

export default router;