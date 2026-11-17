import { Account, JournalEntry } from '../models/Accounting.js';
import { BankAccount, CashMovement } from '../models/Treasury.js';

// --- TESOURARIA & BANCOS ---
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ company: req.company._id });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar contas bancárias.', error: error.message });
  }
};

export const createBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, iban, currency, initialBalance } = req.body;
    const account = await BankAccount.create({
      company: req.company._id,
      bankName,
      accountNumber,
      iban,
      currency,
      balance: initialBalance || 0
    });
    res.status(201).json({ message: 'Conta bancária criada com sucesso!', account });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar conta bancária.', error: error.message });
  }
};

export const registerCashMovement = async (req, res) => {
  try {
    const { bankAccountId, type, category, amount, description, reference } = req.body;

    if (bankAccountId) {
      const bankAcc = await BankAccount.findOne({ _id: bankAccountId, company: req.company._id });
      if (!bankAcc) return res.status(404).json({ message: 'Conta bancária não encontrada.' });

      if (type === 'ENTRADA') bankAcc.balance += Number(amount);
      else if (type === 'SAIDA') bankAcc.balance -= Number(amount);
      await bankAcc.save();
    }

    const movement = await CashMovement.create({
      company: req.company._id,
      bankAccount: bankAccountId || null,
      type,
      category,
      amount,
      description,
      reference
    });

    res.status(201).json({ message: 'Movimento de tesouraria registado!', movement });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registar movimento.', error: error.message });
  }
};

// --- CONTABILIDADE GERAL E DIÁRIO ---
export const getJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ company: req.company._id })
      .populate('lines.account', 'code name')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lançamentos contabilísticos.', error: error.message });
  }
};

export const createJournalEntry = async (req, res) => {
  try {
    const { description, lines } = req.body; // lines: [{ accountId, debit, credit }]
    
    let totalDebit = 0;
    let totalCredit = 0;
    const formattedLines = lines.map(l => {
      totalDebit += Number(l.debit || 0);
      totalCredit += Number(l.credit || 0);
      return { account: l.accountId, debit: l.debit || 0, credit: l.credit || 0 };
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ message: 'Lançamento desequilibrado: Débito deve ser igual a Crédito.' });
    }

    const count = await JournalEntry.countDocuments({ company: req.company._id });
    const entryNumber = `LC ${new Date().getFullYear()}/${String(count + 1).padStart(5, '0')}`;

    const entry = await JournalEntry.create({
      company: req.company._id,
      entryNumber,
      description,
      lines: formattedLines,
      totalAmount: totalDebit
    });

    res.status(201).json({ message: 'Lançamento contabilístico efetuado com sucesso!', entry });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar lançamento.', error: error.message });
  }
};