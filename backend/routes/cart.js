const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user_id: req.userId }).populate('product_id');
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart', error: error.message });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if item already in cart
    const existingCartItem = await Cart.findOne({
      user_id: req.userId,
      product_id: product_id
    });
    
    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();
      const populatedItem = await Cart.findById(existingCartItem._id).populate('product_id');
      return res.json({ message: 'Cart updated', cartItem: populatedItem });
    }
    
    // Create new cart item
    const cartItem = new Cart({
      user_id: req.userId,
      product_id,
      quantity: quantity || 1
    });
    
    await cartItem.save();
    const populatedItem = await Cart.findById(cartItem._id).populate('product_id');
    
    res.status(201).json({ message: 'Item added to cart', cartItem: populatedItem });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart', error: error.message });
  }
});

// Update cart item quantity
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const cartItem = await Cart.findOne({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    if (quantity <= 0) {
      await Cart.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Item removed from cart' });
    }
    
    cartItem.quantity = quantity;
    await cartItem.save();
    
    const populatedItem = await Cart.findById(cartItem._id).populate('product_id');
    res.json({ message: 'Cart updated', cartItem: populatedItem });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:id', authMiddleware, async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error removing from cart', error: error.message });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await Cart.deleteMany({ user_id: req.userId });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart', error: error.message });
  }
});

module.exports = router;

