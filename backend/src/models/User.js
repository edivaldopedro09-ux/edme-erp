import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  hasUsedFreeDemo: { type: Boolean, default: false }, // Impede criar 5 empresas demo grátis seguidas
  role: { type: String, enum: ['USER', 'SUPERADMIN'], default: 'USER' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);