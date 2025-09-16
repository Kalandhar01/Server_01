const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
  {
    url: {
      type: String,
      required: false,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    targetPrice: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    availability: {
      type: String,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);