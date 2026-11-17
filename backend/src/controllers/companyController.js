import Company from '../models/Company.js';
import User from '../models/User.js';

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

// Criar empresa (máximo 5 por utilizador) com plano escolhido
export const createCompany = async (req, res) => {
  try {
    const { name, nif, sector, phone, address, plan } = req.body;

    if (!name || !nif || !plan) {
      return res.status(400).json({ message: 'Nome, NIF e Plano são obrigatórios.' });
    }

    // Verificar limite máximo de 5 empresas
    const companyCount = await Company.countDocuments({ owner: req.user.id });
    if (companyCount >= 5) {
      return res.status(403).json({ message: 'Limite atingido: cada utilizador pode gerir no máximo 5 empresas.' });
    }

    // Verificar se já existe empresa com o mesmo NIF para este utilizador
    const existingNif = await Company.findOne({ owner: req.user.id, nif: nif.trim() }).lean();
    if (existingNif) {
      return res.status(400).json({ message: `Já possui uma empresa registada com o NIF "${nif}".` });
    }

    // Validar plano
    const validPlans = ['DEMO_3D', '1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Plano de subscrição inválido.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    // Regra do Plano Demo de 3 dias (apenas 1 uso por utilizador)
    if (plan === 'DEMO_3D') {
      if (user.hasUsedFreeDemo) {
        return res.status(400).json({ message: 'Já utilizou o período de demonstração gratuito anteriormente.' });
      }
      user.hasUsedFreeDemo = true;
      await user.save();
    }

    // Calcular data de expiração com base no plano
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

    // Demo começa ativa imediatamente; planos pagos começam como ACTIVE para simulação direta (ou PENDING_PAYMENT)
    const status = plan === 'DEMO_3D' ? 'ACTIVE' : 'ACTIVE';

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

    res.status(201).json({
      message: 'Empresa criada com sucesso!',
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