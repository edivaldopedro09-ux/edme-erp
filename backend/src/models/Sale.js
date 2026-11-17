// backend/src/models/Sale.js
import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true },
  customerName: { type: String, default: 'Consumidor Final' },
  customerNif: { type: String, default: '999999999' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['DINHEIRO', 'TPA_MULTICAIXA', 'TRANSFERENCIA'],
    default: 'DINHEIRO'
  }
}, { timestamps: true });

export default mongoose.model('Sale', saleSchema);