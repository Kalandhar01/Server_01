const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// Add product to wishlist
router.post('/', authMiddleware.protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check if item already in wishlist
    let wishlist = await Wishlist.findOne({ userId, productId });
    if (wishlist) {
      return res.status(400).json({ msg: 'Product already in wishlist' });
    }

    wishlist = new Wishlist({
      userId,
      productId,
    });

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's wishlist
router.get('/', authMiddleware.protect, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.user.id }).populate('productId', ['title', 'currentPrice', 'imageUrl']);
    res.json(wishlistItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Remove product from wishlist
router.delete('/:productId', authMiddleware.protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOneAndDelete({ userId, productId });

    if (!wishlist) {
      return res.status(404).json({ msg: 'Product not found in wishlist' });
    }

    res.json({ msg: 'Product removed from wishlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;