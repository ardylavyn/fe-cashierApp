import { getCustomers } from "@/api/customers.api";
import type { Customer } from "@/types/customer";
import { defineStore } from "pinia";

export const useCustomerStore = defineStore("Customer", {
  state: () => ({
    items: [] as Customer[],
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
        const res = await getCustomers({ page: this.page, search: this.search, limit: this.limit });
        this.items = res.data.data.items;
        this.pagination = res.data.data.pagination;
      } catch (error) {
        console.error("Failed fetch customers: ", error);
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
