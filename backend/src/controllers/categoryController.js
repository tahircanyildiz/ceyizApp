const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ householdId: req.householdId }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Kategoriler alınamadı', error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Kategori adı zorunludur' });
    }

    const category = new Category({
      name,
      householdId: req.householdId,
      createdBy: req.user._id,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Kategori oluşturulamadı', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, householdId: req.householdId },
      { name },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Kategori güncellenemedi', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      householdId: req.householdId,
    });

    if (!category) {
      return res.status(404).json({ message: 'Kategori bulunamadı' });
    }

    res.json({ message: 'Kategori silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Kategori silinemedi', error: err.message });
  }
};
