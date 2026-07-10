import type { productCategory } from "./product-category";

export interface Product {
  id: number;
  image: string | null;
  name: string;
  price: number;
  stock: number;
  category: productCategory | null;
}
