import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator, // Added for loading state
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Divider,
  Title, // Added Title for consistent Paper styling
  Paragraph, // Added Paragraph for consistent Paper styling
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

export default function OrderConfirmationScreen({ route, navigation }) {
  // Destructure and provide a default empty object for safety
  const { order: rawOrder } = route.params || {};

  // 1. STATE FOR LOADING/ERROR HANDLING
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  // 2. DATA VALIDATION AND PROCESSING HOOK
  useEffect(() => {
    // Basic validation
    if (!rawOrder || !rawOrder.items || !rawOrder._id) {
      console.error("Order data is missing or incomplete.");
      setOrder(null); // Explicitly set to null to trigger error/fallback UI
      setLoading(false);
      return;
    }
    
    // Set the validated order data and calculate delivery date
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    
    setOrder({
      ...rawOrder,
      estimatedDelivery,
    });
    setLoading(false);
  }, [rawOrder]);
  
// --- START OF UI RENDERING ---

  // 3. RENDER LOADING STATE
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Paragraph style={{ marginTop: 10 }}>Loading order details...</Paragraph>
      </View>
    );
  }

  // 4. RENDER ERROR/FALLBACK STATE (No order data)
  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Title style={styles.errorTitle}>Order Details Not Found</Title>
        <Paragraph style={styles.errorSubtitle}>
          We couldn't load the confirmation details. Please check your order history.
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Profile')}
          style={{ marginTop: 20 }}
          icon="history"
        >
          Go to Order History
        </Button>
      </View>
    );
  }

  // 5. RENDER SUCCESS STATE
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Animatable.View animation="bounceIn" duration={1000} style={styles.iconContainer}>
        <Text style={styles.successIcon}>✅</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" duration={800}>
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>Thank you for your purchase</Text>

        {/* ORDER DETAILS CARD */}
        <Card style={styles.card}>
          <Card.Title title="Order Details" />
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Order ID:</Text>
              <Text style={styles.value}>{order._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Order Date:</Text>
              <Text style={styles.value}>
                {new Date(order.order_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, styles.status]}>{order.status || 'Processing'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Estimated Delivery:</Text>
              <Text style={styles.value}>{order.estimatedDelivery.toLocaleDateString()}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* ITEMS ORDERED CARD */}
        <Card style={styles.card}>
          <Card.Title title="Items Ordered" />
          <Card.Content>
            {order.items.map((item, index) => (
              <View key={item._id || index}> {/* Use item._id for better keying */}
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
                {index < order.items.length - 1 && <Divider style={styles.itemDivider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* SHIPPING INFORMATION CARD */}
        <Card style={styles.card}>
          <Card.Title title="Shipping Information" />
          <Card.Content>
            <Paragraph style={styles.address}>{order.shipping_address || 'Address not provided'}</Paragraph>
          </Card.Content>
        </Card>

        {/* PAYMENT METHOD CARD */}
        <Card style={styles.card}>
          <Card.Title title="Payment Method" />
          <Card.Content>
            <Paragraph>{order.payment_method || 'N/A'}</Paragraph>
          </Card.Content>
        </Card>

        {/* TOTAL AMOUNT CARD */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>${(order.total_amount || 0).toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Profile')}
            style={styles.button}
            icon="history"
          >
            View Order History
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
          >
            Continue Shopping
          </Button>
        </View>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20, // Add padding at the bottom for better scroll feel
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F', // Red color for error
    marginBottom: 10,
  },
  errorSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  successIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 15, // Changed to horizontal margin
    marginVertical: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  status: {
    color: '#4CAF50',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  itemDivider: {
    marginVertical: 5,
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  buttonContainer: {
    padding: 15,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 6,
  },
});