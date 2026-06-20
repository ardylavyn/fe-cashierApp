import type { productCategory } from "./product-category";

export interface Product {
  id: number;
  image: string | null;
  name: string;
  price: string;
  stock: number;
  category: productCategory | null;
}
