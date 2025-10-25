import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.data);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await cartAPI.updateCart(cartItemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Update cart error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update cart' };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartAPI.removeFromCart(cartItemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to remove from cart' };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      return { success: true };
    } catch (error) {
      console.error('Clear cart error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to clear cart' };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product_id?.price || 0) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

