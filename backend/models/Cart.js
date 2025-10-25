const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, {
  timestamps: true
});

// Ensure unique cart items per user
cartSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);

