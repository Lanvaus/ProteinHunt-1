import React, { createContext, useContext, useEffect, useState } from 'react';
import ApiService from '../services/api-service';
import { useAuth } from './AuthContext';

// Types for cart data
export interface CartItem {
  cartItemId: number;
  mealId: number;
  mealName: string;
  mealImageUrl: string;
  quantity: number;
  pricePerItem: number;
  subTotal: number;
  custom: boolean;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  grandTotal: number;
  totalItems: number;
  uniqueItems: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (mealId: number, quantity: number) => Promise<boolean>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: number) => Promise<boolean>;
  fetchCart: () => Promise<void>;
  getItemQuantity: (mealId: number) => number;
  clearCartError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart on initial load and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  // Fetch the user's cart
  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setError(response.error || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add an item to cart
  const addToCart = async (mealId: number, quantity: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.addToCart(mealId, quantity);
      
      if (response.success) {
        await fetchCart(); // Refresh cart after adding
        return true;
      } else {
        setError(response.error || 'Failed to add item to cart');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while adding to cart');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.updateCartItem(cartItemId, quantity);
      
      if (response.success) {
        await fetchCart(); // Refresh cart after updating
        return true;
      } else {
        setError(response.error || 'Failed to update cart item');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while updating cart');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.removeFromCart(cartItemId);
      
      if (response.success) {
        await fetchCart(); // Refresh cart after removing
        return true;
      } else {
        setError(response.error || 'Failed to remove item from cart');
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while removing from cart');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get quantity of a specific item in cart
  const getItemQuantity = (mealId: number): number => {
    if (!cart || !cart.items) return 0;
    
    const item = cart.items.find(item => item.mealId === mealId);
    return item ? item.quantity : 0;
  };

  // Clear error state
  const clearCartError = () => setError(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        getItemQuantity,
        clearCartError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
