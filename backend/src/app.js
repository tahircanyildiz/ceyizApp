const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partner');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const transcribeRoutes = require('./routes/transcribe');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transcribe', transcribeRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
  })
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
