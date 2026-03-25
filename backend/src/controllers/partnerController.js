const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Partner hesabı oluştur ve mevcut household'a bağla
exports.addPartner = async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    const currentUser = req.user;

    if (!username || !password) {
      return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur' });
    }

    if (username === currentUser.username) {
      return res.status(400).json({ message: 'Kendinizi partner olarak ekleyemezsiniz' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Bu kullanıcı adı zaten kullanımda' });
    }

    // Partnerin email'i otomatik oluştur (giriş için username + şifre yeterli)
    const partnerEmail = `${username}@ceyiz.partner`;

    const partner = new User({
      fullName: fullName || '',
      email: partnerEmail,
      username,
      password,
      householdId: currentUser.householdId,
    });

    await partner.save();

    res.status(201).json({
      message: `${username} başarıyla partner olarak eklendi`,
      partner: { id: partner._id, username: partner.username, fullName: partner.fullName },
    });
  } catch (err) {
    res.status(500).json({ message: 'Partner ekleme hatası', error: err.message });
  }
};

// Mevcut partneri getir
exports.getPartner = async (req, res) => {
  try {
    const partner = await User.findOne({
      householdId: req.householdId,
      _id: { $ne: req.user._id },
    }).select('fullName username email');

    if (!partner) {
      return res.json({ partner: null });
    }

    res.json({ partner: { id: partner._id, fullName: partner.fullName, username: partner.username } });
  } catch (err) {
    res.status(500).json({ message: 'Partner bilgisi alınamadı', error: err.message });
  }
};

// Partner bilgilerini güncelle
exports.updatePartner = async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    const { id } = req.params;

    const partner = await User.findOne({ _id: id, householdId: req.householdId });
    if (!partner) {
      return res.status(404).json({ message: 'Partner bulunamadı' });
    }

    if (username && username !== partner.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ message: 'Bu kullanıcı adı zaten kullanımda' });
      }
      partner.username = username;
    }

    if (fullName !== undefined) partner.fullName = fullName;
    if (password) partner.password = password;

    await partner.save();

    res.json({ message: 'Partner güncellendi', partner: { id: partner._id, fullName: partner.fullName, username: partner.username } });
  } catch (err) {
    res.status(500).json({ message: 'Partner güncellenemedi', error: err.message });
  }
};
