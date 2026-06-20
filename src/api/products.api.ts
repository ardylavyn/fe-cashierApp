import api from "./axios";

// export artinya Function ini boleh dipakai dari file lain.
export const getProducts = (params?: { page?: number; search?: string; limit?: number; byCategory?: number }) => api.get("/products", { params });

// export const createCategory = (payload: { name: string; description?: string }) => api.post("/product-categories", payload);

// export const uploadCategoryImage = (id: number, formData: FormData) =>
//   api.post(`/product-categories/${id}/image`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

// export const getCategoryById = (id: number) => api.get(`/product-categories/${id}`);
// export const updateCategory = (id: number, payload: { name: string; description?: string }) => api.put(`/product-categories/${id}`, payload);

// // pakai `..` karena ada variabel yang harus disisipkan ke dalam string
// export const deleteCategory = (id: number) => api.delete(`/product-categories/${id}`);
