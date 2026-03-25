const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { addPartner, getPartner, updatePartner } = require('../controllers/partnerController');

router.use(authMiddleware);

router.get('/', getPartner);
router.post('/add', addPartner);
router.put('/:id', updatePartner);

module.exports = router;
