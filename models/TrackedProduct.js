const mongoose = require('mongoose');

const TrackedProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  productLink: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notified: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('TrackedProduct', TrackedProductSchema);
