const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const products = [
  // Electronics
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    stock: 50,
    rating: 4.5,
    reviews: [
      { user: 'John Doe', comment: 'Excellent sound quality!', rating: 5 },
      { user: 'Jane Smith', comment: 'Very comfortable', rating: 4 }
    ]
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracker with heart rate monitor and GPS',
    price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    stock: 35,
    rating: 4.3
  },
  {
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand for better posture',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    category: 'Electronics',
    stock: 100,
    rating: 4.7
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    category: 'Electronics',
    stock: 150,
    rating: 4.4
  },
  
  // Clothing
  {
    name: 'Classic T-Shirt',
    description: '100% cotton comfortable t-shirt in various colors',
    price: 24.99,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    category: 'Clothing',
    stock: 200,
    rating: 4.2
  },
  {
    name: 'Denim Jeans',
    description: 'Slim fit denim jeans with premium fabric',
    price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
    category: 'Clothing',
    stock: 80,
    rating: 4.6
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with excellent cushioning',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'Clothing',
    stock: 60,
    rating: 4.8
  },
  {
    name: 'Winter Jacket',
    description: 'Warm and stylish winter jacket with hood',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    category: 'Clothing',
    stock: 40,
    rating: 4.5
  },
  
  // Home & Garden
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
    category: 'Home & Garden',
    stock: 45,
    rating: 4.4
  },
  {
    name: 'Indoor Plant Set',
    description: 'Set of 3 low-maintenance indoor plants with pots',
    price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
    category: 'Home & Garden',
    stock: 70,
    rating: 4.6
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB charging port',
    price: 34.99,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    category: 'Home & Garden',
    stock: 90,
    rating: 4.3
  },
  
  // Sports
  {
    name: 'Yoga Mat',
    description: 'Premium non-slip yoga mat with carrying strap',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    category: 'Sports',
    stock: 120,
    rating: 4.7
  },
  {
    name: 'Dumbbell Set',
    description: 'Adjustable dumbbell set with storage rack',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
    category: 'Sports',
    stock: 30,
    rating: 4.5
  },
  {
    name: 'Water Bottle',
    description: 'Insulated stainless steel water bottle, 32oz',
    price: 24.99,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    category: 'Sports',
    stock: 200,
    rating: 4.8
  },
  
  // Books
  {
    name: 'JavaScript Guide',
    description: 'Comprehensive guide to modern JavaScript programming',
    price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    category: 'Books',
    stock: 75,
    rating: 4.6
  },
  {
    name: 'Design Thinking',
    description: 'Learn the principles of design thinking and innovation',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500',
    category: 'Books',
    stock: 60,
    rating: 4.4
  },
  
  // Toys
  {
    name: 'Building Blocks Set',
    description: '500-piece creative building blocks for kids',
    price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500',
    category: 'Toys',
    stock: 85,
    rating: 4.7
  },
  {
    name: 'Educational Puzzle',
    description: 'Educational wooden puzzle for early learning',
    price: 19.99,
    image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500',
    category: 'Toys',
    stock: 110,
    rating: 4.5
  },
  
  // Beauty
  {
    name: 'Skincare Set',
    description: 'Complete skincare routine set with natural ingredients',
    price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500',
    category: 'Beauty',
    stock: 55,
    rating: 4.6
  },
  {
    name: 'Hair Dryer',
    description: 'Professional ionic hair dryer with multiple settings',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500',
    category: 'Beauty',
    stock: 40,
    rating: 4.4
  },
  
  // Food
  {
    name: 'Organic Honey',
    description: 'Pure organic honey, 16oz jar',
    price: 14.99,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?w=500',
    category: 'Food',
    stock: 100,
    rating: 4.8
  },
  {
    name: 'Green Tea Set',
    description: 'Premium green tea collection with 5 varieties',
    price: 24.99,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    category: 'Food',
    stock: 80,
    rating: 4.5
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert seed data
    await Product.insertMany(products);
    console.log('✅ Successfully seeded database with', products.length, 'products');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

