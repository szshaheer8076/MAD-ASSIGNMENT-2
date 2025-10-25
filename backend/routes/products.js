const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sortBy } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort option
    let sortOption = {};
    if (sortBy === 'price_asc') {
      sortOption.price = 1;
    } else if (sortBy === 'price_desc') {
      sortOption.price = -1;
    } else if (sortBy === 'rating') {
      sortOption.rating = -1;
    } else {
      sortOption.createdAt = -1;
    }
    
    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products', error: error.message });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product', error: error.message });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories', error: error.message });
  }
});

module.exports = router;

