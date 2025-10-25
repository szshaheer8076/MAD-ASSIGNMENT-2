import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  RadioButton,
  Card,
  Divider,
  HelperText,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = getCartTotal();
  const shippingCost = 5.99;
  const tax = total * 0.1;
  const grandTotal = total + shippingCost + tax;

  const handlePlaceOrder = async () => {
    setError('');
    
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id._id,
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems,
        total_amount: grandTotal,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      };

      const response = await orderAPI.createOrder(orderData);
      
      setLoading(false);
      
      // Navigate to order confirmation
      navigation.replace('OrderConfirmation', { order: response.data.order });
    } catch (error) {
      setLoading(false);
      console.error('Place order error:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Animatable.View animation="fadeInUp" duration={600}>
          <Card style={styles.card}>
            <Card.Title title="Shipping Address" />
            <Card.Content>
              <TextInput
                label="Enter your full address"
                value={shippingAddress}
                onChangeText={setShippingAddress}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Payment Method" />
            <Card.Content>
              <RadioButton.Group
                onValueChange={setPaymentMethod}
                value={paymentMethod}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="Credit Card" />
                  <Text style={styles.radioLabel}>Credit Card</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Debit Card" />
                  <Text style={styles.radioLabel}>Debit Card</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="PayPal" />
                  <Text style={styles.radioLabel}>PayPal</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Cash on Delivery" />
                  <Text style={styles.radioLabel}>Cash on Delivery</Text>
                </View>
              </RadioButton.Group>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Order Summary" />
            <Card.Content>
              <View style={styles.summaryRow}>
                <Text>Subtotal ({cartItems.length} items)</Text>
                <Text>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Shipping</Text>
                <Text>${shippingCost.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Tax (10%)</Text>
                <Text>${tax.toFixed(2)}</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>

          {error ? (
            <HelperText type="error" visible={true} style={styles.error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handlePlaceOrder}
            loading={loading}
            disabled={loading}
            style={styles.placeOrderButton}
            icon="check"
          >
            Place Order
          </Button>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  input: {
    marginTop: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  divider: {
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  error: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  placeOrderButton: {
    margin: 15,
    paddingVertical: 8,
  },
});

