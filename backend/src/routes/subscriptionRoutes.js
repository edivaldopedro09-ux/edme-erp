import express from 'express';
import SubscriptionRequest from '../models/SubscriptionRequest.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireSuperAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// 1. CLIENTE: Enviar pedido de upgrade com comprovativo
router.post('/request', protect, async (req, res) => {
  try {
    const { planName, companiesLimit, amount, paymentMethod, proofUrl } = req.body;

    // Impede duplicação se já tiver um pedido à espera de validação
    const existingPending = await SubscriptionRequest.findOne({ 
      user: req.user.id, 
      status: 'pending' 
    });

    if (existingPending) {
      return res.status(400).json({ 
        message: 'Já tem um pedido de pagamento em análise. Aguarde a validação do administrador.' 
      });
    }

    const request = await SubscriptionRequest.create({
      user: req.user.id,
      planName,
      companiesLimit,
      amount,
      paymentMethod,
      proofUrl
    });

    res.status(201).json({ 
      message: 'Comprovativo submetido com sucesso! Aguarde a aprovação para cadastrar novas empresas.', 
      request 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao submeter pedido.', error: error.message });
  }
});

// 2. CLIENTE: Consultar o histórico dos seus próprios pedidos
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await SubscriptionRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar os seus pedidos.' });
  }
});

// 3. SUPERADMIN: Listar todos os pedidos de todos os utilizadores
router.get('/admin/all', protect, requireSuperAdmin, async (req, res) => {
  try {
    const requests = await SubscriptionRequest.find()
      .populate('user', 'name email phone currentPlan maxCompanies')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar pedidos para o painel admin.' });
  }
});

// 4. SUPERADMIN: Aprovar ou Rejeitar um pedido
router.put('/admin/:id/status', protect, requireSuperAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body; // 'approved' ou 'rejected'
    const subRequest = await SubscriptionRequest.findById(req.params.id);

    if (!subRequest) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    if (subRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Este pedido já foi processado anteriormente.' });
    }

    subRequest.status = status;
    subRequest.adminNotes = adminNotes || '';
    await subRequest.save();

    // Se aprovado, liberta o novo limite de empresas na conta do cliente e desbloqueia empresas pendentes
    if (status === 'approved') {
      await User.findByIdAndUpdate(subRequest.user, {
        maxCompanies: subRequest.companiesLimit,
        currentPlan: subRequest.planName
      });

      await Company.updateMany(
        { owner: subRequest.user, 'subscription.status': 'PENDING_PAYMENT' },
        { 
          $set: { 
            'subscription.status': 'ACTIVE', 
            'subscription.startDate': new Date() 
          } 
        }
      );
    }

    res.json({ 
      message: `Pedido ${status === 'approved' ? 'aprovado e plano ativado' : 'rejeitado'} com sucesso!`, 
      subRequest 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar aprovação.' });
  }
});

export default router;