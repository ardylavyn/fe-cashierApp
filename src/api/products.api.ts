import api from "./axios";

// export artinya Function ini boleh dipakai dari file lain.
export const getProducts = (params?: { page?: number; search?: string; limit?: number; byCategory?: number }) => api.get("/products", { params });

export const getProductsOptions = (params?: { search?: string; limit?: number; byCategory?: number }) => api.get("/products/options", { params });

export const createProduct = (payload: { name: string; product_category_id: number; price: string; stock: string }) => api.post("/products", payload);

export const uploadProductImage = (id: number, formData: FormData) =>
  api.post(`/products/${id}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getProductById = (id: number) => api.get(`/products/${id}`);
export const updateProduct = (id: number, payload: { name: string; product_category_id: number; price: string; stock: string }) => api.put(`/products/${id}`, payload);

// pakai `..` karena ada variabel yang harus disisipkan ke dalam string
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);
