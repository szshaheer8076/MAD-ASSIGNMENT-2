import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  IconButton,
  Divider,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartScreen({ navigation }) {
  const { cartItems, loading, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Please login to view your cart</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          style={styles.loginButton}
        >
          Login
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animatable.Text animation="fadeIn" style={styles.emptyText}>
          Your cart is empty
        </Animatable.Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        >
          Start Shopping
        </Button>
      </View>
    );
  }

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromCart(cartItemId);
    } else {
      await updateCartItem(cartItemId, newQuantity);
    }
  };

  const renderCartItem = ({ item, index }) => {
    const product = item.product_id;
    if (!product) return null;

    return (
      <Animatable.View animation="fadeInUp" delay={index * 100} duration={600}>
        <Card style={styles.cartCard}>
          <Card.Content>
            <View style={styles.cartItemContainer}>
              <Image source={{ uri: product.image_url }} style={styles.productImage} />
              
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                
                <View style={styles.quantityContainer}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  />
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= product.stock}
                  />
                </View>
              </View>

              <View style={styles.rightSection}>
                <IconButton
                  icon="delete"
                  iconColor="red"
                  size={24}
                  onPress={() => removeFromCart(item._id)}
                />
                <Text style={styles.itemTotal}>
                  ${(product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animatable.View>
    );
  };

  const total = getCartTotal();

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.bottomContainer}>
        <Divider />
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>
        
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Checkout')}
          style={styles.checkoutButton}
          icon="arrow-right"
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          Proceed to Checkout
        </Button>
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  shopButton: {
    marginTop: 10,
  },
  loginButton: {
    marginTop: 10,
  },
  listContainer: {
    padding: 10,
  },
  cartCard: {
    marginBottom: 10,
    elevation: 2,
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#6200ee',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  rightSection: {
    alignItems: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 15,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  checkoutButton: {
    paddingVertical: 6,
  },
});

