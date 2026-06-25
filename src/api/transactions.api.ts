import api from "./axios";

export const getTransactions = (params?: { page?: number; search?: string; limit?: number }) => api.get("/transactions", { params });

export const getTransactionById = (id: number) => api.get(`/transactions/${id}`);

export const getTransactionOptions = (search?: string) =>
  api.get("/transactions/options", {
    params: { search },
  });

export const refundTransaction = (
  id: number,
  payload: {
    reason: string;
    items: {
      transaction_item_id: number;
      quantity: number;
      return_to_stock: boolean;
    }[];
  },
) => api.post(`/transactions/${id}/refund`, payload);
