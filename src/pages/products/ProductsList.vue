<script setup lang="ts">
import { Button, Column, DataTable, IconField, InputIcon, InputText, Select, useConfirm, ConfirmDialog, useToast } from "primevue";
import { RouterLink, useRouter } from "vue-router";
import { useProductStore } from "@/stores/product.store";
import { useProductCategoryStore } from "@/stores/product-category.store";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { deleteProduct } from "@/api/products.api";
import { usePermission } from "@/composable/usePermission.ts";

const { can, canAny } = usePermission();
const productStore = useProductStore();

const { fetch, setLimit, setPage, prevPage, nextPage } = productStore;

const { items, pagination, loading, limit, search, byCategory } = storeToRefs(productStore);

const confirm = useConfirm();
const toast = useToast();
const router = useRouter();

const onSearch = useDebounceFn(() => {
  // Kalau ada pencarian baru, tampilkan hasil dari halaman pertama.
  setPage(1);
}, 400);

const confirmDelete = (id: number) => {
  confirm.require({
    message: "Are u sure to delete this product?",
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
        await deleteProduct(id);
        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: "Product Removed",
          life: 3000,
        });
        fetch();
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete product",
          life: 3000,
        });
      }
    },
  });
};

const confirmEdit = (id: number) => {
  router.push(`/products/${id}/edit`);
};

const productCategoryStore = useProductCategoryStore();
const { fetchOptions } = productCategoryStore;
const { options } = storeToRefs(productCategoryStore);

const onCategoryChange = () => {
  productStore.page = 1;
  fetch();
};

onMounted(() => {
  fetch();
  fetchOptions();
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Products</h1>
        <p class="text-surface-500 text-sm">The list here show all the products</p>
      </div>

      <!-- as-child itu supaya Link tampil seperti Button -->
      <Button as-child v-slot="slotProps" v-if="can('create_products')">
        <!-- name itu dari index.ts -->
        <RouterLink :to="{ name: 'products-create' }" :class="slotProps.class"> Add Product </RouterLink>
      </Button>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 p-2">
      <div class="flex flex-col md:flex-row justify-between items-center py-4 px-4 gap-4">
        <!-- SEARCH -->
        <IconField iconPosition="left" class="w-full md:w-80">
          <InputIcon class="pi pi-search text-surface-400" />
          <InputText v-model="search" placeholder="Search" @input="onSearch" />
        </IconField>

        <!-- FILTERING -->
        <!-- optionVlue itu yang nnti diambil berdasarkan id -->
        <Select v-model="byCategory" :options="options" optionLabel="name" optionValue="id" placeholder="All Categories" @update:model-value="onCategoryChange" />
      </div>

      <DataTable :value="items" :loading="loading" data-key="id" class="clean-table" :row-hover="true">
        <!-- No -->
        <Column header="No.">
          <template #body="{ index }">
            {{ (pagination.current_page - 1) * limit + index + 1 }}
          </template>
        </Column>

        <!-- Nama Produk -->
        <Column field="name" header="Name" class="min-w-[16rem]">
          <!-- Saya menerima object dari PrimeVue, lalu saya ambil property data -->
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <div class="relative">
                <img :src="data.image" :alt="data.name" class="w-10 h-10 rounded-full object-cover bg-surface-100" />
              </div>
              <span class="font-semibold text-surface-900">{{ data.name }}</span>
            </div>
          </template>
        </Column>

        <!-- Harga Produk -->
        <Column header="Price">
          <template #body="{ data }">
            {{
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(Number(data.price))
            }}
          </template>
        </Column>

        <!-- Stok Produk -->
        <Column header="Stock">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-full"
                :class="data.stock > 10 ? 'bg-green-100 text-green-700' : data.stock > 0 ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'"
              >
                {{ data.stock }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Category Produk -->
        <Column field="category.name" header="Category"></Column>

        <Column header="Actions" style="width: 5rem" v-if="canAny(['edit_products', 'delete_products'])">
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
