const express = require('express');
const { scrapeProduct } = require('../controllers/scraperController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', scrapeProduct);

module.exports = router;