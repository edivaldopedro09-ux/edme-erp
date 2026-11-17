import Company from '../models/Company.js';

export const verifyCompanyAccess = async (req, res, next) => {
  try {
    const companyId = req.headers['x-company-id'];

    if (!companyId) {
      return res.status(400).json({ message: 'Empresa não selecionada (Header x-company-id ausente).' });
    }

    const company = await Company.findOne({ _id: companyId, owner: req.user.id });

    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada ou acesso negado.' });
    }

    // Verifica se o pagamento ainda está pendente
    if (company.subscription.status === 'PENDING_PAYMENT') {
      return res.status(402).json({
        code: 'PAYMENT_PENDING',
        message: 'O pagamento do plano desta empresa ainda não foi confirmado.',
        company
      });
    }

    // Verifica expiração em tempo real (Demo de 3 dias ou planos pagos)
    const now = new Date();
    if (company.subscription.expiresAt && now > new Date(company.subscription.expiresAt)) {
      if (company.subscription.status !== 'EXPIRED') {
        company.subscription.status = 'EXPIRED';
        await company.save();
      }

      return res.status(402).json({
        code: 'PLAN_EXPIRED',
        message: 'O plano desta empresa expirou. Renove para continuar operando.',
        company
      });
    }

    req.company = company;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao validar acesso da empresa.', error: error.message });
  }
};