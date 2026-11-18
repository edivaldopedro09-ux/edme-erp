import User from '../models/User.js';

export const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        message: 'Acesso restrito. Apenas o SuperAdmin pode realizar esta ação.' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar permissões de administrador.' });
  }
};