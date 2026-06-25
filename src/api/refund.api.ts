import api from "./axios";

export const getRefunds = (params?: { page?: number; search?: string; limit?: number }) => api.get("/transactions/refunds", { params });

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
