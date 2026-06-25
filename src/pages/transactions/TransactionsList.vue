<script setup lang="ts">
import router from "@/router";
import { useTransactionStore } from "@/stores/transaction.store";
import { useDebounceFn } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select } from "primevue";
import { onMounted } from "vue";

const TransactionStore = useTransactionStore();
const { fetch, setPage, setLimit, nextPage, prevPage } = TransactionStore;
const { items, loading, search, pagination, limit } = storeToRefs(TransactionStore);

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

const onSearch = useDebounceFn(() => {
  setPage(1);
}, 400);

const confirmShow = (id: number) => {
  router.push(`/transactions/${id}/show`);
};

onMounted(() => {
  fetch();
});
</script>
<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Transactions</h1>
        <p class="text-surface-500 text-sm">The list here show all the transactions</p>
      </div>
    </div>
    <div class="bg-white rounded-2xl border border-surface-200 p-2">
      <div class="flex flex-col md:flex-row justify-between items-center py-4 px-4 gap-4">
        <!-- SEARCH -->
        <IconField iconPosition="left" class="w-full md:w-80">
          <InputIcon class="pi pi-search text-surface-400" />
          <InputText v-model="search" placeholder="Search by code..." @input="onSearch" />
        </IconField>
      </div>

      <DataTable :value="items" :loading="loading" data-key="id" class="clean-table" :row-hover="true">
        <Column header="No.">
          <template #body="{ index }">
            {{ (pagination.current_page - 1) * limit + index + 1 }}
          </template>
        </Column>
        <Column field="code" header="Code" class="text-green-700 font-semibold"></Column>
        <Column field="customer.name" header="Customer" class="font-normal"></Column>
        <Column header="Total">
          <template #body="{ data }">
            <span class="font-extrabold text-base">{{
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(Number(data.total))
            }}</span>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-full" :class="data.status == 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ data.status }}
              </span>
            </div>
          </template>
        </Column>
        <Column header="Date" class="font-semibold">
          <template #body="{ data }">
            <span class="font-medium text-sm">{{ formatDate(data.created_at) }}</span>
          </template>
        </Column>
        <Column header="Actions" style="width: 5rem">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Button
                icon="pi pi-eye"
                text
                rounded
                severity="danger"
                class="w-9! h-9! border-surface-200! text-surface-200! hover:text-red-600! hover:border-primary-500 hover:bg-primary-50 bg-white"
                @click="confirmShow(data.id)"
              />
            </div>
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
