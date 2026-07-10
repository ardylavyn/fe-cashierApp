import { createTransaction } from "@/api/transactions.api";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/transaction";
import { defineStore } from "pinia";

export const usePosStore = defineStore("pos", {
  state: () => ({
    cart: [] as CartItem[],
    customerId: null as number | null,
    loading: false,
  }),

  getters: {
    subtotal: (state) => {
      return state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    },
    tax: (state) => {
      const subtotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return Math.round(subtotal * 0.11);
    },
    total(): number {
      return this.subtotal + this.tax;
    },
    itemCount: (state) => {
      return state.cart.reduce((sum, item) => sum + item.quantity, 0);
    },
  },

  actions: {
    addToCart(product: Product) {
      const existing = this.cart.find((item) => item.product.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.cart.push({ product, quantity: 1 });
      }
    },

    removeFromCart(productIdFromView: number) {
      const index = this.cart.findIndex((item) => item.product.id === productIdFromView);

      if (index > -1) {
        this.cart.splice(index, 1);
      }
    },

    updateQuantity(productIdFromView: number, quantityFromView: number) {
      const item = this.cart.find((item) => item.product.id === productIdFromView);

      if (item) {
        if (quantityFromView <= 0) {
          this.removeFromCart(productIdFromView);
        } else {
          item.quantity = quantityFromView;
        }
      }
    },

    clearCart() {
      this.cart = [];
    },

    async checkout(paid: number, sendNotification: boolean = false) {
      if (!this.customerId) {
        throw new Error("Customer is required ");
      }

      this.loading = true;

      try {
        const payload = {
          customer_id: this.customerId,
          paid: paid,
          items: this.cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          send_notification: sendNotification,
        };
        const res = await createTransaction(payload);

        this.clearCart();
        return res.data.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
