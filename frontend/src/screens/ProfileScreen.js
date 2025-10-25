import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Avatar,
  List,
  Divider,
  ActivityIndicator,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';
import { orderAPI, profileAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      setEditData({
        name: user?.name || '',
        address: user?.address || '',
        phone: user?.phone || '',
      });
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await profileAPI.updateProfile(editData);
      updateUser(response.data.user);
      setEditDialogVisible(false);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Please login to view your profile</Text>
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

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeIn" duration={800}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={user?.name?.charAt(0).toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Button
              mode="outlined"
              onPress={() => setEditDialogVisible(true)}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Account Information" />
          <Card.Content>
            <List.Item
              title="Address"
              description={user?.address || 'Not provided'}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />
            <Divider />
            <List.Item
              title="Phone"
              description={user?.phone || 'Not provided'}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title={`Order History (${orders.length})`}
            right={(props) => (
              <Button onPress={fetchOrders} loading={loading}>
                Refresh
              </Button>
            )}
          />
          <Card.Content>
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : orders.length === 0 ? (
              <Text style={styles.noOrders}>No orders yet</Text>
            ) : (
              orders.map((order) => (
                <TouchableOpacity
                  key={order._id}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order._id })}
                >
                  <List.Item
                    title={`Order #${order._id.slice(-8).toUpperCase()}`}
                    description={`${new Date(order.order_date).toLocaleDateString()} - $${order.total_amount.toFixed(2)}`}
                    left={(props) => <List.Icon {...props} icon="package-variant" />}
                    right={(props) => (
                      <View style={styles.orderStatus}>
                        <Text style={styles.statusText}>{order.status}</Text>
                        <List.Icon {...props} icon="chevron-right" />
                      </View>
                    )}
                  />
                  <Divider />
                </TouchableOpacity>
              ))
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          buttonColor='#6200ee'
        >
          Logout
        </Button>
      </Animatable.View>

      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Address"
              value={editData.address}
              onChangeText={(text) => setEditData({ ...editData, address: text })}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
            />
            <TextInput
              label="Phone"
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateProfile}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
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
    padding: 20,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 10,
  },
  profileCard: {
    margin: 10,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  editButton: {
    marginTop: 10,
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  loader: {
    marginVertical: 20,
  },
  noOrders: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 15,
    paddingVertical: 6,
  },
  input: {
    marginBottom: 10,
  },
});

