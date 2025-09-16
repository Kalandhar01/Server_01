const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Fetch single product
// @route   GET /api/products/:productId
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product (for testing purposes)
// @route   POST /api/products
// @access  Private (requires authentication)
router.post('/', protect, async (req, res) => {
  const { productId, title, currentPrice, description, imageUrls } = req.body;

  try {
    const product = new Product({
      productId,
      title,
      currentPrice,
      description,
      imageUrls,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Set a target price for a product
// @route   POST /api/products/:productId/targetPrice
// @access  Private (requires authentication)
// @desc    Get target price for a product
// @route   GET /api/products/:productId/targetPrice
// @access  Private (requires authentication)
router.get('/:productId/targetPrice', protect, async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ productId });

    if (product) {
      res.status(200).json({ targetPrice: product.targetPrice });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/:productId/targetPrice', protect, async (req, res) => {
  const { targetPrice } = req.body;
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ productId });

    if (product) {
      product.targetPrice = targetPrice;
      await product.save();
      res.status(200).json({ message: `Target price ${targetPrice} set for product ${productId}` });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;