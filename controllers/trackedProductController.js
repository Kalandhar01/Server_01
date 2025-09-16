const TrackedProduct = require('../models/TrackedProduct');
const Product = require('../models/Product');

// Add a tracked product for a user
exports.addTrackedProduct = async (req, res) => {
  const userId = req.user._id;
  const { productId, targetPrice, productLink } = req.body;
  try {
    const tracked = await TrackedProduct.create({ userId, productId, targetPrice, productLink });
    res.status(201).json(tracked);
  } catch (error) {
    res.status(500).json({ message: 'Error tracking product', error: error.message });
  }
};

// Get all tracked products for a user
exports.getTrackedProducts = async (req, res) => {
  const userId = req.user._id;
  try {
    const tracked = await TrackedProduct.find({ userId }).populate('productId');
    res.json(tracked);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tracked products', error: error.message });
  }
};

// Remove a tracked product for a user
exports.removeTrackedProduct = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    await TrackedProduct.deleteOne({ _id: id, userId });
    res.json({ message: 'Tracked product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing tracked product', error: error.message });
  }
};
