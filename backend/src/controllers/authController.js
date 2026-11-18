import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está registado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // O novo utilizador nasce com role 'USER', maxCompanies: 1 e plano grátis
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Utilizador registado com sucesso!',
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role,
        maxCompanies: user.maxCompanies,
        currentPlan: user.currentPlan
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao registar utilizador.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    res.json({
      message: 'Login efectuado com sucesso!',
      token: generateToken(user._id),
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        role: user.role,
        maxCompanies: user.maxCompanies,
        currentPlan: user.currentPlan
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor ao fazer login.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do utilizador.', error: error.message });
  }
};