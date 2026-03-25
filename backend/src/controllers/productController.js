const Product = require('../models/Product');

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, householdId: req.householdId });
    if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ürün alınamadı', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = { householdId: req.householdId };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Ürünler alınamadı', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, brand, imageUrl, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: 'Ürün adı ve kategori zorunludur' });
    }

    const product = new Product({
      name,
      price: price || 0,
      brand: brand || '',
      imageUrl: imageUrl || '',
      categoryId,
      householdId: req.householdId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ürün oluşturulamadı', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, brand, imageUrl, isPurchased } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, householdId: req.householdId },
      { name, price, brand, imageUrl, isPurchased },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ürün güncellenemedi', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      householdId: req.householdId,
    });

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.json({ message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Ürün silinemedi', error: err.message });
  }
};
