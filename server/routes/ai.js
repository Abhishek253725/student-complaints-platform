const express = require('express');
const router = express.Router();
const { analyze } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyze);

module.exports = router;
