exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya bulunamadı' });
    }

    res.json({ imageUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ message: 'Yükleme hatası', error: err.message });
  }
};
