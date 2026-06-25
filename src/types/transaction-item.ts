import type { Product } from "./product";

export interface TransactionItem {
  id: number;
  price: number;
  quantity: number;
  refunded_quantity: number;
  subtotal: string;
  product: Product;
}
