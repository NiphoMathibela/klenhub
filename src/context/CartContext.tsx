import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product, ProductSize } from '../types';
import { cart as cartApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
}

type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: { product: Product; size: ProductSize } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: number; size: ProductSize } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; size: ProductSize; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product, size: ProductSize) => Promise<void>;
  removeFromCart: (productId: number, size: ProductSize) => Promise<void>;
  updateQuantity: (productId: number, size: ProductSize, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
} | null>(null);

const calculateTotal = (items: CartItem[]): number => {
  if (!items) return 0;
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.product.id === action.payload.product.id && 
          item.size.id === action.payload.size.id
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
        };
      }

      const newItems = [...state.items, { product: action.payload.product, quantity: 1, size: action.payload.size }];
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(
        item => 
          !(item.product.id === action.payload.productId && 
            item.size.id === action.payload.size.id)
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product.id === action.payload.productId && 
        item.size.id === action.payload.size.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    loading: false,
  });

  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const cartData = await cartApi.getCart();
          dispatch({ type: 'SET_CART', payload: cartData.items || [] });
        } catch (error) {
          console.error('Error fetching cart:', error);
          dispatch({ type: 'SET_CART', payload: [] });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_CART', payload: [] });
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product: Product, size: ProductSize) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.addToCart(product.id, size.id, 1);
      dispatch({ type: 'ADD_TO_CART', payload: { product, size } });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (productId: number, size: ProductSize) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.removeFromCart(productId, size.id);
      dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, size } });
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (productId: number, size: ProductSize, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.updateQuantity(productId, size.id, quantity);
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartApi.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <CartContext.Provider value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;