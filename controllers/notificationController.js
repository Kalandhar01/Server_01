const TrackedProduct = require('../models/TrackedProduct');
const User = require('../models/User');
const { sendPriceAlert } = require('../utils/mailer');

// Call this function after product price update
exports.checkAndNotifyTargetPrice = async (product) => {
  if (!product.currentPrice) return;
  // Find all tracked products for this product
  const tracked = await TrackedProduct.find({ productId: product._id }).populate('userId');
  for (const tp of tracked) {
    if (product.currentPrice <= tp.targetPrice && !tp.notified) {
      if (tp.userId && tp.userId.email) {
        await sendPriceAlert(
          tp.userId.email,
          product.title,
          product.currentPrice,
          tp.targetPrice
        );
        tp.notified = true;
        await tp.save();
      }
    }
  }
};
