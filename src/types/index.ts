export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductSize {
  id: number;
  name: string;
  stock: number;
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  created_at: string;
  category: string;
  subcategory: string;
  images: ProductImage[];
  sizes: ProductSize[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: ProductSize;
}

export interface CartState {
  items: CartItem[];
}

export interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' };