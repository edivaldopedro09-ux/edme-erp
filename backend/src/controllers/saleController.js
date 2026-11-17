import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import { JournalEntry, Account } from '../models/Accounting.js';
import { BankAccount } from '../models/Treasury.js';

// Listar todas as vendas da empresa ativa
export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ company: req.company._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name sku');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vendas.', error: error.message });
  }
};

// Registar nova venda (com automação de stock, tesouraria e contabilidade)
export const createSale = async (req, res) => {
  try {
    const { customerName, customerNif, items, paymentMethod, bankAccountId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'A venda deve conter pelo menos um item.' });
    }

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, company: req.company._id });
      
      if (!product) {
        return res.status(404).json({ message: `Produto não encontrado.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para: ${product.name}. Disponível: ${product.stock}` });
      }

      // Baixa de Stock em Tempo Real
      product.stock -= item.quantity;
      await product.save();

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal
      });
    }

    const salesCount = await Sale.countDocuments({ company: req.company._id });
    const invoiceNumber = `FT ${new Date().getFullYear()}/${String(salesCount + 1).padStart(5, '0')}`;

    const sale = await Sale.create({
      company: req.company._id,
      seller: req.user.id,
      invoiceNumber,
      customerName: customerName || 'Consumidor Final',
      customerNif: customerNif || '999999999',
      items: processedItems,
      totalAmount,
      paymentMethod: paymentMethod || 'DINHEIRO'
    });

    // Atualização Automática de Bancos/Caixa se associado
    if (bankAccountId) {
      const bank = await BankAccount.findOne({ _id: bankAccountId, company: req.company._id });
      if (bank) {
        bank.balance += totalAmount;
        await bank.save();
      }
    }

    // Lançamento Automático na Contabilidade Geral
    let cashAccount = await Account.findOne({ company: req.company._id, type: 'ATIVO' });
    let revenueAccount = await Account.findOne({ company: req.company._id, type: 'RENDIMENTO' });

    if (cashAccount && revenueAccount) {
      const entryCount = await JournalEntry.countDocuments({ company: req.company._id });
      await JournalEntry.create({
        company: req.company._id,
        entryNumber: `AUT-${new Date().getFullYear()}/${String(entryCount + 1).padStart(5, '0')}`,
        description: `Automático: Venda ${invoiceNumber} - ${customerName}`,
        totalAmount,
        lines: [
          { account: cashAccount._id, debit: totalAmount, credit: 0 },
          { account: revenueAccount._id, debit: 0, credit: totalAmount }
        ]
      });
    }

    res.status(201).json({ message: 'Venda registada e contabilizada automaticamente!', sale });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar venda automática.', error: error.message });
  }
};