import { defineStore } from "pinia";
import { ref } from "vue";
import { getDashboardStatistics } from "@/api/dashboard.api";
import type { DashboardStatistics } from "@/types/dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
  const statistics = ref<DashboardStatistics | null>(null);

  const loading = ref(false);

  const fetchStatistics = async () => {
    loading.value = true;

    try {
      const res = await getDashboardStatistics();

      statistics.value = res.data.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    statistics,
    loading,
    fetchStatistics,
  };
});
