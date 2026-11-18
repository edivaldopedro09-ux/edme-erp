import mongoose from 'mongoose';

const subscriptionRequestSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  planName: { 
    type: String, 
    required: true 
  }, // Ex: 'Plano Pro (Até 3 Empresas)'
  companiesLimit: { 
    type: Number, 
    required: true 
  }, // Ex: 3 ou 999
  amount: { 
    type: Number, 
    required: true 
  }, // Ex: 15000 (Kz)
  paymentMethod: { 
    type: String, 
    required: true 
  }, // Ex: 'Transferência IBAN' ou 'Multicaixa Express'
  proofUrl: { 
    type: String, 
    required: true 
  }, // Link do comprovativo ou referência/nº de operação
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminNotes: { 
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('SubscriptionRequest', subscriptionRequestSchema);