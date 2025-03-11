import React, { createContext, useContext, useReducer } from 'react';
import { orderService } from '../services/api';
import { CartItem, Product, CartState, CartAction, CartContextType } from '../types';

const CartContext = createContext<CartContextType | null>(null);

// Helper function to safely convert ID values to numbers
const safeParseInt = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseInt(value, 10) || 0; // Fallback to 0 if parsing fails
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id && item.size === action.payload.size
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity || 1;
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems),
        };
      }

      const newItems = [...state.items, { 
        product: action.payload.product, 
        quantity: action.payload.quantity || 1, 
        size: action.payload.size 
      }];
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(
        item => !(item.product.id === action.payload.productId && item.size === action.payload.size)
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => {
        if (item.product.id === action.payload.productId && item.size === action.payload.size) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const checkout = async () => {
    try {
      const orderData = {
        items: state.items.map(item => ({
          productId: String(item.product.id),
          quantity: item.quantity,
          size: item.size
        })),
        total: state.total,
        recipientName: "User Name",
        phoneNumber: "1234567890",
        addressLine1: "123 Main St",
        city: "City",
        province: "Province",
        postalCode: "12345"
      };

      await orderService.createOrder(orderData);
      
      dispatch({ type: 'CLEAR_CART' });
      
      // Redirect to success page or show success message
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <CartContext.Provider value={{ state, dispatch, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { useCartContext as useCart };