import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Text,
  Searchbar,
  ActivityIndicator,
  Card,
  Button,
  Chip,
  SegmentedButtons,
  Snackbar,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CategoriesScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const categories = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Food'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, minPrice, maxPrice, sortBy, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products error:', error);
      showSnackbar('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    const result = await addToCart(productId, 1);
    if (result.success) {
      showSnackbar('Added to cart successfully!');
    } else {
      showSnackbar(result.message || 'Failed to add to cart');
    }
  };

  const showSnackbar = (message) => {
    setSnackbar({ visible: true, message });
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setSearchQuery('');
  };

  const renderProduct = ({ item, index }) => (
    <Animatable.View animation="fadeInUp" delay={index * 50} duration={600}>
      <Card style={styles.productCard}>
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
          <View style={styles.cardRow}>
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <Text style={styles.rating}>⭐ {item.rating || 0}</Text>
            </View>
            <View style={styles.actionSection}>
              {item.stock > 0 ? (
                <Button
                  mode="contained"
                  onPress={() => handleAddToCart(item._id)}
                  compact
                  style={styles.addButton}
                >
                  Add
                </Button>
              ) : (
                <Text style={styles.outOfStock}>Out of Stock</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search products..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Filters</Text>
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
              style={styles.categoryChip}
              mode="outlined"
            >
              {item}
            </Chip>
          )}
          style={styles.categoryList}
        />

        <View style={styles.priceFilter}>
          <Text style={styles.filterLabel}>Price Range:</Text>
          <View style={styles.priceInputs}>
            <TextInput
              placeholder="Min"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
              style={styles.priceInput}
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              placeholder="Max"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              style={styles.priceInput}
            />
          </View>
        </View>

        <View style={styles.sortSection}>
          <Text style={styles.filterLabel}>Sort By:</Text>
          <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
              { value: 'price_asc', label: '$ Low' },
              { value: 'price_desc', label: '$ High' },
              { value: 'rating', label: 'Rating' },
            ]}
            style={styles.sortButtons}
          />
        </View>

        <Button mode="text" onPress={clearFilters} style={styles.clearButton}>
          Clear All Filters
        </Button>
      </View>

      <Text style={styles.resultCount}>
        {filteredProducts.length} products found
      </Text>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
        action={{
          label: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  searchBar: {
    margin: 10,
    elevation: 2,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 10,
    elevation: 2,
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryList: {
    marginBottom: 10,
  },
  categoryChip: {
    marginRight: 8,
  },
  priceFilter: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  priceSeparator: {
    marginHorizontal: 10,
  },
  sortSection: {
    marginBottom: 10,
  },
  sortButtons: {
    marginTop: 5,
  },
  clearButton: {
    marginTop: 5,
  },
  resultCount: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  productCard: {
    marginBottom: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    padding: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6200ee',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 2,
  },
  rating: {
    fontSize: 12,
  },
  actionSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    minWidth: 70,
  },
  outOfStock: {
    color: 'red',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

