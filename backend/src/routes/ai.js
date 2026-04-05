const express = require('express');
const router = express.Router();
const {
    chatWithAI,
    analyzeDescription,
    enhanceDescription
} = require('../controllers/aiController');

router.post('/chat', chatWithAI);
router.post('/analyze-description', analyzeDescription);
router.post('/enhance-description', enhanceDescription);

module.exports = router;
