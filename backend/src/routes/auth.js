const express = require('express');
const router = express.Router();
const { register, login, updatePlayerID } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.put('/player-id', auth, updatePlayerID);

module.exports = router;
