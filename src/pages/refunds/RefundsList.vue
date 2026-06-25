<script setup lang="ts">
import { useRefundStore } from "@/stores/refund.store";
import { formatDate, useDebounceFn } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select } from "primevue";
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

const RefundStore = useRefundStore();
const selectedPeriod = ref("this_month");
const { fetch, setPage, setLimit, nextPage, prevPage } = RefundStore;
const { items, loading, search, pagination, limit } = storeToRefs(RefundStore);

const onSearch = useDebounceFn(() => {
  // Kalau ada pencarian baru, tampilkan hasil dari halaman pertama.
  setPage(1);
}, 400);

const periodOptions = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
];

const formatDate = (date: string) => {
  const d = new Date(date);

  const tanggal = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${tanggal}, ${jam}`;
};

onMounted(() => {
  fetch();
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Refunds</h1>
        <p class="text-surface-500 text-sm">The list here show all the Refunds</p>
      </div>
      <Button as-child v-slot="slotProps">
        <!-- name itu dari index.ts -->
        <RouterLink :to="{ name: 'refunds-create' }" :class="slotProps.class"> Add Data Refund </RouterLink>
      </Button>
    </div>
    <div class="bg-white rounded-2xl border border-surface-200 p-2">
      <div class="flex flex-col md:flex-row justify-between items-center py-4 px-4 gap-4">
        <!-- SEARCH -->
        <IconField iconPosition="left" class="w-full md:w-80">
          <InputIcon class="pi pi-search text-surface-400" />
          <InputText v-model="search" placeholder="Search by code..." @input="onSearch" />
        </IconField>

        <!-- PERIOD FILTER -->
        <Select v-model="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="value" placeholder="Filter by period" class="w-full md:w-56" />
      </div>

      <DataTable :value="items" :loading="loading" data-key="id" class="clean-table" :row-hover="true">
        <Column header="No.">
          <template #body="{ index }">
            {{ (pagination.current_page - 1) * limit + index + 1 }}
          </template>
        </Column>
        <Column field="code" header="Code" class="text-green-700 font-semibold"></Column>
        <Column header="Refunded Products">
          <template #body="{ data }">
            {{
              data.transactionItems
                .filter((item) => item.refunded_quantity > 0)
                .map((item) => `${item.product.name} (${item.refunded_quantity}x)`)
                .join(", ")
            }}
          </template>
        </Column>
        <Column field="refund.reason" header="Reason" class="text-green-700 font-semibold"></Column>
        <Column header="Date" class="font-semibold">
          <template #body="{ data }">
            <span class="font-medium text-sm">{{ formatDate(data.refund.created_at) }}</span>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-surface-500">Rows per page:</span>
          <Select :model-value="limit" :options="[5, 10, 20, 50]" @update:model-value="setLimit" />
        </div>

        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-surface-600"> {{ pagination.current_page }} of {{ pagination.last_page }} </span>

          <div class="flex gap-1">
            <Button
              icon="pi pi-chevron-left"
              text
              rounded
              severity="secondary"
              :disabled="pagination.current_page === 1"
              class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!"
              @click="prevPage()"
            ></Button>
            <Button
              icon="pi pi-chevron-right"
              text
              rounded
              severity="secondary"
              :disabled="pagination.current_page === pagination.last_page"
              class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!"
              @click="nextPage()"
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
