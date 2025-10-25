const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// Get user's orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.userId })
      .sort({ order_date: -1 })
      .populate('items.product_id');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.userId
    }).populate('items.product_id');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order', error: error.message });
  }
});

// Create new order
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { items, total_amount, shipping_address, payment_method } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    
    // Verify products and get details
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      orderItems.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image_url: product.image_url
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Create order
    const order = new Order({
      user_id: req.userId,
      items: orderItems,
      total_amount,
      shipping_address,
      payment_method,
      status: 'Pending'
    });
    
    await order.save();
    
    // Clear user's cart
    await Cart.deleteMany({ user_id: req.userId });
    
    const populatedOrder = await Order.findById(order._id).populate('items.product_id');
    
    res.status(201).json({ 
      message: 'Order created successfully', 
      order: populatedOrder 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
});

module.exports = router;

