const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Email veya kullanıcı adı zaten kullanımda' });
    }

    const user = new User({ email, username, password, fullName: fullName || '' });
    await user.save();

    // householdId = kendi _id'si ile başlar
    user.householdId = user._id;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, username: user.username, fullName: user.fullName, householdId: user.householdId },
    });
  } catch (err) {
    res.status(500).json({ message: 'Kayıt hatası', error: err.message });
  }
};

exports.updatePlayerID = async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ message: 'playerId zorunludur' });
    await User.findByIdAndUpdate(req.user._id, { oneSignalPlayerId: playerId });
    res.json({ message: 'Player ID güncellendi' });
  } catch (err) {
    res.status(500).json({ message: 'Player ID güncellenemedi', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Kullanıcı adı/email ve şifre zorunludur' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, email: user.email, username: user.username, fullName: user.fullName, householdId: user.householdId },
    });
  } catch (err) {
    res.status(500).json({ message: 'Giriş hatası', error: err.message });
  }
};
