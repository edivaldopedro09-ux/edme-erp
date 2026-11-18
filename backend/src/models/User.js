import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  hasUsedFreeDemo: { type: Boolean, default: false }, // Impede abusos do período gratuito
  
  // Controlo de Permissões e Planos SaaS
  role: { 
    type: String, 
    enum: ['USER', 'SUPERADMIN'], 
    default: 'USER' 
  },
  maxCompanies: { 
    type: Number, 
    default: 1 // Começa com direito a 1 empresa grátis
  },
  currentPlan: { 
    type: String, 
    default: 'Grátis (1 Empresa)' 
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);