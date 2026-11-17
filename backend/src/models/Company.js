import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  nif: { type: String, required: true, trim: true }, // Identificação fiscal
  sector: { type: String, default: 'Comércio Geral' },
  phone: { type: String },
  address: { type: String },
  currency: { type: String, default: 'AOA' },

  // Controle de Assinatura Individual por Empresa
  subscription: {
    plan: {
      type: String,
      enum: ['DEMO_3D', '1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR'],
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_PAYMENT', 'EXPIRED'],
      default: 'PENDING_PAYMENT'
    },
    startDate: { type: Date },
    expiresAt: { type: Date },
    paymentReference: { type: String } // Referência de pagamento ou comprovativo
  }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);