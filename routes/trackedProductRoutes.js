const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  addTrackedProduct,
  getTrackedProducts,
  removeTrackedProduct,
} = require('../controllers/trackedProductController');

const router = express.Router();

router.post('/', protect, addTrackedProduct);
router.get('/', protect, getTrackedProducts);
router.delete('/:id', protect, removeTrackedProduct);

module.exports = router;
