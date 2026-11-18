import Company from '../models/Company.js';
import User from '../models/User.js';
import SubscriptionRequest from '../models/SubscriptionRequest.js';

const PLAN_PRICES = {
  DEMO_3D: { label: 'Demo Gratuita (3 Dias)', price: 0 },
  '1_MONTH': { label: 'Plano Mensal (1 Mês)', price: 15000 },
  '3_MONTHS': { label: 'Plano Trimestral (3 Meses)', price: 40000 },
  '6_MONTHS': { label: 'Plano Semestral (6 Meses)', price: 75000 },
  '1_YEAR': { label: 'Plano Anual (1 Ano)', price: 130000 },
};

// Listar empresas do utilizador logado
export const getMyCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ owner: req.user.id })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    res.json(companies || []);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ message: 'Erro ao buscar empresas.', error: error.message });
  }
};

// Criar empresa com validação de limite SaaS e registo de pagamento
export const createCompany = async (req, res) => {
  try {
    const { name, nif, sector, phone, address, plan, paymentMethod, proofUrl } = req.body;

    if (!name || !nif || !plan) {
      return res.status(400).json({ message: 'Nome, NIF e Plano são obrigatórios.' });
    }

    const planInfo = PLAN_PRICES[plan];
    if (!planInfo) {
      return res.status(400).json({ message: 'Plano de subscrição inválido.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // 1. Verificar limite máximo de empresas permitidas no plano atual do utilizador
    const companyCount = await Company.countDocuments({ owner: req.user.id });
    if (companyCount >= user.maxCompanies) {
      return res.status(403).json({
        code: 'LIMIT_REACHED',
        message: `O seu plano atual (${user.currentPlan}) permite gerir no máximo ${user.maxCompanies} empresa(s). Faça upgrade para adicionar mais.`
      });
    }

    // 2. Verificar NIF duplicado na mesma conta
    const existingNif = await Company.findOne({ owner: req.user.id, nif: nif.trim() }).lean();
    if (existingNif) {
      return res.status(400).json({ message: `Já possui uma empresa registada com o NIF "${nif}".` });
    }

    // 3. Regras específicas para Demo Grátis vs Plano Pago
    if (plan === 'DEMO_3D') {
      if (user.hasUsedFreeDemo) {
        return res.status(400).json({ message: 'Já utilizou o período de demonstração gratuito anteriormente. Escolha um plano pago.' });
      }
      user.hasUsedFreeDemo = true;
      await user.save();
    } else {
      if (!proofUrl || !proofUrl.trim()) {
        return res.status(400).json({ message: 'O comprovativo ou referência de pagamento é obrigatório para planos pagos.' });
      }
    }

    // 4. Calcular data de expiração
    const startDate = new Date();
    let expiresAt = new Date();

    switch (plan) {
      case 'DEMO_3D':
        expiresAt.setDate(startDate.getDate() + 3);
        break;
      case '1_MONTH':
        expiresAt.setMonth(startDate.getMonth() + 1);
        break;
      case '3_MONTHS':
        expiresAt.setMonth(startDate.getMonth() + 3);
        break;
      case '6_MONTHS':
        expiresAt.setMonth(startDate.getMonth() + 6);
        break;
      case '1_YEAR':
        expiresAt.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    // Demo ativa imediatamente; planos pagos ficam bloqueados (PENDING_PAYMENT) até aprovação do Admin
    const status = plan === 'DEMO_3D' ? 'ACTIVE' : 'PENDING_PAYMENT';

    const newCompany = await Company.create({
      owner: req.user.id,
      name: name.trim(),
      nif: nif.trim(),
      sector: sector || 'Comércio Geral',
      phone: phone || '',
      address: address || '',
      subscription: {
        plan,
        status,
        startDate,
        expiresAt
      }
    });

    // 5. Se for plano pago, cria o pedido de aprovação para o Painel Admin
    if (plan !== 'DEMO_3D') {
      await SubscriptionRequest.create({
        user: req.user.id,
        company: newCompany._id, // Referência opcional à empresa criada
        planName: `${planInfo.label} - ${newCompany.name}`,
        companiesLimit: user.maxCompanies,
        amount: planInfo.price,
        paymentMethod: paymentMethod || 'Transferência Bancária (IBAN)',
        proofUrl: proofUrl.trim(),
        status: 'pending'
      });
    }

    res.status(201).json({
      message:
        plan === 'DEMO_3D'
          ? 'Empresa criada com sucesso! Aproveite os 3 dias de acesso gratuito.'
          : 'Empresa registada! O comprovativo foi enviado e a empresa será desbloqueada após aprovação do administrador.',
      company: newCompany
    });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ message: 'Erro ao criar empresa.', error: error.message });
  }
};

// Renovar ou ativar plano de uma empresa existente
export const renewCompanyPlan = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { plan } = req.body;

    const validRenewalPlans = ['1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR'];
    if (!validRenewalPlans.includes(plan)) {
      return res.status(400).json({ message: 'Plano inválido para renovação.' });
    }

    const company = await Company.findOne({ _id: companyId, owner: req.user.id });
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada.' });
    }

    const startDate = new Date();
    let expiresAt = new Date();

    switch (plan) {
      case '1_MONTH':
        expiresAt.setMonth(startDate.getMonth() + 1);
        break;
      case '3_MONTHS':
        expiresAt.setMonth(startDate.getMonth() + 3);
        break;
      case '6_MONTHS':
        expiresAt.setMonth(startDate.getMonth() + 6);
        break;
      case '1_YEAR':
        expiresAt.setFullYear(startDate.getFullYear() + 1);
        break;
    }

    company.subscription.plan = plan;
    company.subscription.status = 'ACTIVE';
    company.subscription.startDate = startDate;
    company.subscription.expiresAt = expiresAt;

    await company.save();

    res.json({ message: 'Plano renovado com sucesso!', company });
  } catch (error) {
    console.error('Erro ao renovar plano:', error);
    res.status(500).json({ message: 'Erro ao renovar plano.', error: error.message });
  }
};