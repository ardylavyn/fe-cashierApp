import { defineStore } from "pinia";
import type { Transaction } from "@/types/transaction";
import { getTransactions } from "@/api/transactions.api";

export const useTransactionStore = defineStore("Transaction", {
  state: () => ({
    items: [] as Transaction[],

    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: 0,
      to: 0,
    },

    page: 1,
    limit: 5,

    search: "",

    loading: false,
  }),

  actions: {
    async fetch() {
      this.loading = true;

      try {
        // res itu respon
        const res = await getTransactions({ page: this.page, search: this.search, limit: this.limit });
        this.items = res.data.data.items;
        this.pagination = res.data.data.pagination;
      } catch (error) {
        console.error("Failed fetch transactions: ", error);
      } finally {
        this.loading = false;
      }
    },

    setPage(page: number) {
      this.page = page;
      this.fetch();
    },

    setLimit(limit: number) {
      // kita ingin set limit yg di atas sama dengan parameter limit
      this.limit = limit;
      this.page = 1;
      this.fetch();
    },

    nextPage() {
      if (this.pagination.current_page < this.pagination.last_page) {
        this.page = this.pagination.current_page + 1;
        this.fetch();
      }
    },

    prevPage() {
      if (this.pagination.current_page > 1) {
        this.page = this.pagination.current_page - 1;
        this.fetch();
      }
    },
  },
});
