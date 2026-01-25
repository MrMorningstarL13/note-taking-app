const express = require('express');
const router = express.Router();
const { generateContent } = require('../controllers/ai');
const { checkAuth } = require('../middlewares/authCheck');

router.post('/generate', checkAuth, generateContent);

module.exports = router;
