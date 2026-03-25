const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { uploadImage } = require('../controllers/uploadController');

router.post('/', authMiddleware, upload.single('image'), uploadImage);

module.exports = router;
