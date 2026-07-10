<script setup lang="ts">
import { useCustomerStore } from "@/stores/customer.store";
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select, useConfirm, useToast, ConfirmDialog } from "primevue";

import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import { deleteCustomer } from "@/api/customers.api";
import { usePermission } from "@/composable/usePermission.ts";

const router = useRouter();

const { can, canAny } = usePermission();

const CustomerStore = useCustomerStore();
const { fetch, setLimit, setPage, nextPage, prevPage } = CustomerStore;
const { items, loading, limit, search, pagination } = storeToRefs(CustomerStore);

const confirm = useConfirm();
const toast = useToast();

const onSearch = useDebounceFn(() => {
  // Kalau ada pencarian baru, tampilkan hasil dari halaman pertama.
  setPage(1);
}, 400);

onMounted(() => {
  fetch();
});

const confirmEdit = (id: number) => {
  router.push(`/customers/${id}/edit`);
};

const confirmDelete = (id: number) => {
  confirm.require({
    message: "Are u sure to delete this customer?",
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },

    accept: async () => {
      try {
        await deleteCustomer(id);
        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: "Customer Removed",
          life: 3000,
        });
        fetch();
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete customer",
          life: 3000,
        });
      }
    },
  });
};
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Customers</h1>
        <p class="text-surface-500 text-sm">The list here show all the customer</p>
      </div>

      <!-- as-child itu supaya Link tampil seperti Button -->
      <Button as-child v-slot="slotProps">
        <!-- name itu dari index.ts -->
        <RouterLink :to="{ name: 'customers-create' }" :class="slotProps.class"> Add Customer </RouterLink>
      </Button>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 p-2">
      <div class="flex flex-col md:flex-row justify-between items-center py-4 px-4 gap-4">
        <!-- SEARCH -->
        <IconField iconPosition="left" class="w-full md:w-80">
          <InputIcon class="pi pi-search text-surface-400" />
          <InputText v-model="search" placeholder="Search" @input="onSearch" />
        </IconField>
      </div>

      <DataTable :value="items" :loading="loading" data-key="id" class="clean-table" :row-hover="true">
        <Column header="No.">
          <template #body="{ index }">
            {{ (pagination.current_page - 1) * limit + index + 1 }}
          </template>
        </Column>
        <Column field="name" header="Name" class="min-w-[16rem]">
          <!-- Saya menerima object dari PrimeVue, lalu saya ambil property data -->
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 bg-green-100">
                <i class="pi pi-user text-lg text-green-600"></i>
              </div>
              <span class="font-semibold text-surface-900">{{ data.name }}</span>
            </div>
          </template>
        </Column>

        <Column field="phone" header="Number phone"></Column>

        <Column header="Actions" style="width: 5rem" v-if="canAny(['edit_customers', 'delete_customers'])">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                class="w-9! h-9! border-surface-200! text-surface-200! hover:text-red-600! hover:border-primary-500 hover:bg-primary-50 bg-white"
                @click="confirmDelete(data.id)"
              />

              <Button
                icon="pi pi-pencil"
                text
                rounded
                severity="danger"
                class="w-9! h-9! border-surface-200! text-surface-200! hover:text-red-600! hover:border-primary-500 hover:bg-primary-50 bg-white"
                @click="confirmEdit(data.id)"
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

  <ConfirmDialog />
</template>
