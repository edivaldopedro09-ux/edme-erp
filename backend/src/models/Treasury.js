import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  bankName: { type: String, required: true }, // Ex: Standard Bank Angola, BAI, BFA
  accountNumber: { type: String, required: true },
  iban: { type: String, required: true },
  currency: { type: String, default: 'AOA' },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

const cashMovementSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  type: { type: String, enum: ['ENTRADA', 'SAIDA', 'TRANSFERENCIA'], required: true },
  category: { type: String, required: true }, // Ex: Vendas, Fornecedores, Salários, Impostos
  amount: { type: Number, required: true },
  description: { type: String },
  reference: { type: String }
}, { timestamps: true });

export const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export const CashMovement = mongoose.model('CashMovement', cashMovementSchema);