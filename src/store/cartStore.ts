'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      total: 0,

      addToCart: (product: Product) => {
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          const newCart = existing
            ? state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...state.cart, { ...product, quantity: 1 }];
          return {
            cart: newCart,
            total: newCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        });
      },

      removeFromCart: (productId: number) => {
        set((state) => {
          const newCart = state.cart.filter((item) => item.id !== productId);
          return {
            cart: newCart,
            total: newCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        });
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity < 1) return;
        set((state) => {
          const newCart = state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          );
          return {
            cart: newCart,
            total: newCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          };
        });
      },

      clearCart: () => {
        set({ cart: [], total: 0 });
      },
    }),
    {
      name: 'amigo-cart',
    }
  )
);
