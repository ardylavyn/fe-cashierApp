<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import Chart from "primevue/chart";
import { computed } from "vue";

import { useDashboardStore } from "@/stores/dashboard.store";

const dashboardStore = useDashboardStore();

const { statistics, loading } = storeToRefs(dashboardStore);

onMounted(async () => {
  await dashboardStore.fetchStatistics();
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const chartData = computed(() => {
  if (!statistics.value) return null;

  return {
    labels: statistics.value.revenue_chart.map((item) =>
      new Date(item.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
    ),

    datasets: [
      {
        data: statistics.value.revenue_chart.map((item) => item.revenue),

        borderColor: "#10b981",
        borderWidth: 3,

        pointRadius: 0,
        pointHoverRadius: 5,

        fill: true,

        tension: 0.45,

        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);

          gradient.addColorStop(0, "rgba(16,185,129,.35)");
          gradient.addColorStop(1, "rgba(16,185,129,0)");

          return gradient;
        },
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: "index",
    intersect: false,
  },

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      backgroundColor: "#111827",
      titleColor: "#fff",
      bodyColor: "#fff",

      callbacks: {
        label: function (context: any) {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(context.parsed.y);
        },
      },
    },
  },

  scales: {
    x: {
      grid: {
        display: false,
      },

      border: {
        display: false,
      },

      ticks: {
        color: "#94a3b8",
      },
    },

    y: {
      beginAtZero: true,

      grid: {
        color: "#eef2f7",
      },

      border: {
        display: false,
      },

      ticks: {
        color: "#94a3b8",

        callback: function (value: any) {
          if (value >= 1000000) {
            return value / 1000000 + "M";
          }

          if (value >= 1000) {
            return value / 1000 + "K";
          }

          return value;
        },
      },
    },
  },
};
</script>

<template>
  <div class="w-full">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Dashboard</h1>
    </div>

    <div v-if="loading" class="text-center py-20">Loading...</div>

    <template v-else-if="statistics">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- Revenue -->
        <div class="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center">
              <i class="pi pi-wallet text-white text-2xl"></i>
            </div>

            <div>
              <div class="text-sm text-surface-500">Pendapatan Hari Ini</div>

              <div class="text-3xl font-bold mt-1">
                {{ formatCurrency(statistics?.todays_revenue ?? 0) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction -->
        <div class="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center">
              <i class="pi pi-shopping-cart text-white text-2xl"></i>
            </div>

            <div>
              <div class="text-sm text-surface-500">Transaksi Hari Ini</div>

              <div class="text-3xl font-bold mt-1">
                {{ statistics?.todays_transactions }}
              </div>
            </div>
          </div>
        </div>

        <!-- Product Sold -->
        <div class="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-purple-500 flex items-center justify-center">
              <i class="pi pi-check text-white text-2xl"></i>
            </div>

            <div>
              <div class="text-sm text-surface-500">Produk Terjual Hari Ini</div>

              <div class="text-3xl font-bold mt-1">
                {{ statistics?.product_sold_today }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-surface-200 p-4 md:p-6 shadow-sm">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-chart-line text-emerald-500 text-lg"></i>

          <h2 class="font-bold text-base md:text-lg">Grafik Pendapatan (30 Hari Terakhir)</h2>
        </div>

        <div class="h-56 md:h-72 lg:h-80">
          <Chart type="line" :data="chartData" :options="chartOptions" class="h-full w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Best Selling -->
        <div class="bg-white rounded-2xl border border-surface-200 p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-star text-green-500"></i>
            <h2 class="font-bold text-lg">Produk Terlaris</h2>
          </div>

          <div class="grid grid-cols-[70px_1fr_90px] font-semibold text-sm text-surface-500 border-b pb-2 mb-3">
            <div>Produk</div>
            <div></div>
            <div class="text-right">Terjual</div>
          </div>

          <div v-for="product in statistics?.best_selling_products" :key="product.product_id" class="grid grid-cols-[70px_1fr_90px] items-center py-3 border-b border-surface-100 last:border-none">
            <img :src="product.image" class="w-14 h-14 rounded-lg object-cover" />

            <div>
              <div class="font-semibold">
                {{ product.name }}
              </div>

              <div class="text-sm text-surface-500">
                {{ formatCurrency(Number(product.price)) }}
              </div>
            </div>

            <div class="text-right">
              <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold"> {{ product.total_sold }} unit </span>
            </div>
          </div>
        </div>

        <!-- Low Stock -->
        <!-- Low Stock -->
        <div class="bg-white rounded-2xl border border-surface-200 p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-exclamation-triangle text-orange-500"></i>
            <h2 class="font-bold text-lg">Stok Hampir Habis</h2>
          </div>

          <template v-if="statistics?.low_stock_products.length">
            <div class="grid grid-cols-[70px_1fr_90px] font-semibold text-sm text-surface-500 border-b pb-2 mb-3">
              <div>Produk</div>
              <div></div>
              <div class="text-right">Stok</div>
            </div>

            <div v-for="product in statistics.low_stock_products" :key="product.id" class="grid grid-cols-[70px_1fr_90px] items-center py-3 border-b border-surface-100 last:border-none">
              <img :src="product.image" class="w-14 h-14 rounded-lg object-cover" />

              <div>
                <div class="font-semibold">
                  {{ product.name }}
                </div>

                <div class="text-sm text-surface-500">
                  {{ formatCurrency(Number(product.price)) }}
                </div>
              </div>

              <div class="text-right">
                <span :class="['text-xs px-3 py-1 rounded-full font-semibold', product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700']"> {{ product.stock }} unit </span>
              </div>
            </div>
          </template>

          <div v-else class="flex flex-col items-center justify-center my-30 text-center">
            <i class="pi pi-check-circle text-5xl text-green-500 mb-3"></i>

            <p class="font-semibold text-surface-700">Tidak ada produk yang stoknya hampir habis.</p>

            <p class="text-sm text-surface-500 mt-1">Semua produk memiliki stok lebih dari 10 unit.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
