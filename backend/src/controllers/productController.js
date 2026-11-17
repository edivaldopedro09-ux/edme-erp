import Product from '../models/Product.js';

// Listar produtos da empresa ativa
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ company: req.company._id }).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: error.message });
  }
};

// Criar produto na empresa ativa
export const createProduct = async (req, res) => {
  try {
    const { name, sku, price, costPrice, stock } = req.body;

    const product = await Product.create({
      company: req.company._id,
      name,
      sku,
      price,
      costPrice,
      stock
    });

    res.status(201).json({ message: 'Produto criado com sucesso!', product });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto.', error: error.message });
  }
};

// Atualizar produto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndUpdate(
      { _id: id, company: req.company._id },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.json({ message: 'Produto atualizado com sucesso!', product });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto.', error: error.message });
  }
};

// Eliminar produto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id, company: req.company._id });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.json({ message: 'Produto eliminado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao eliminar produto.', error: error.message });
  }
};