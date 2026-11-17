import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  code: { type: String, required: true }, // Ex: 11.1 (Caixa), 31.1 (Clientes)
  name: { type: String, required: true },
  type: { type: String, enum: ['ATIVO', 'PASSIVO', 'CAPITAL', 'GASTO', 'RENDIMENTO'], required: true },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

const journalEntrySchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  entryNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  lines: [{
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 }
  }],
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);
export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);