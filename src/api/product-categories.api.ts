import api from "./axios";

// export artinya Function ini boleh dipakai dari file lain.
export const getCategories = (params?: { page?: number; search?: string; limit?: number }) => api.get("/product-categories", { params });

// pakai `..` karena ada variabel yang harus disisipkan ke dalam string
export const deleteCategory = (id: number) => api.delete(`/product-categories/${id}`);
