import api from "./axios";

export const getCustomers = (params?: { page?: number; search?: string; limit?: number }) => api.get("/customers", { params });

export const createCustomer = (payload: { name: string; phone?: string }) => api.post("/customers", payload);

export const getCustomerById = (id: number) => api.get(`/customers/${id}`);

export const updateCustomer = (id: number, payload: { name: string; phone?: string }) => api.put(`/customers/${id}`, payload);

export const deleteCustomer = (id: number) => api.delete(`/customers/${id}`);
