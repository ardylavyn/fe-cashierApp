<script setup lang="ts">
import { Button, Column, ConfirmDialog, DataTable, IconField, InputIcon, InputText, Select, useConfirm, useToast } from "primevue";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";

import { useProductCategoryStore } from "@/stores/product-category.store";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { outlined } from "@primeuix/themes/aura/message";
import { deleteCategory } from "@/api/product-categories.api";
import type CategoryForm from "./CategoryForm.vue";
import { usePermission } from "@/composable/usePermission.ts";

const router = useRouter();

const { can, canAny } = usePermission();

const productCategoryStore = useProductCategoryStore();
// Ini untuk actions
const { fetch, setLimit, setPage, nextPage, prevPage } = productCategoryStore;
// Ini untuk variable
const { items, loading, limit, currentPage, totalPages, search } = storeToRefs(productCategoryStore);

// ini tadi yang dipasang di main.ts yang ConfirmationService
const confirm = useConfirm();
const toast = useToast();

const onSearch = useDebounceFn(() => {
  // Kalau ada pencarian baru, tampilkan hasil dari halaman pertama.
  setPage(1);
}, 400);

const confirmDelete = (id: number) => {
  confirm.require({
    message: "Are u sure to delete this category?",
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
        await deleteCategory(id);
        toast.add({
          severity: "success",
          summary: "Deleted",
          detail: "Category Removed",
          life: 3000,
        });
        fetch();
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete category",
          life: 3000,
        });
      }
    },
  });
};

const confirmEdit = (id: number) => {
  router.push(`/product-categories/${id}/edit`);
};

onMounted(() => {
  fetch();
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Product Categories</h1>
        <p class="text-surface-500 text-sm">The list here show all product categories</p>
      </div>

      <!-- as-child itu supaya Link tampil seperti Button -->
      <Button as-child v-slot="slotProps" v-if="can('create_product_categories')">
        <!-- name itu dari index.ts -->
        <RouterLink :to="{ name: 'product-categories-create' }" :class="slotProps.class"> Add Category </RouterLink>
      </Button>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 p-2">
      <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
        <IconField iconPosition="left" class="w-full md:w-80">
          <InputIcon class="pi pi-search text-surface-400" />
          <InputText v-model="search" placeholder="Search" @input="onSearch" />
        </IconField>
      </div>
      <!-- Oke, saya diberi sebuah array (:value="items"). Saya akan mengambil satu object untuk setiap baris. Datanya dari items -->

      <!-- Baris pertama, Object yang diambil adalah :

        {
            id:1,
            name:"Makanan"
        }

        Lalu PrimeVue memberi nama object itu "data" ketika mengirimnya ke slot.

        data =
        {
            id:1,
            name:"Makanan"
        }

      -->
      <DataTable :value="items" :loading="loading" data-key="id" class="clean-table" :row-hover="true">
        <Column header="No.">
          <template #body="{ index }">
            {{ (currentPage - 1) * limit + index + 1 }}
          </template>
        </Column>
        <Column field="name" header="name" class="min-w-[16rem]">
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

        <Column field="description" header="Description"></Column>

        <Column header="Actions" style="width: 5rem" v-if="canAny(['edit_product_categories', 'delete_product_categories'])">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Button
                v-if="can('edit_product_categories')"
                icon="pi pi-pencil"
                text
                rounded
                class="w-9! h-9! border-surface-200! text-surface-200! hover:text-primary-600! hover:border-primary-500 hover:bg-primary-50 bg-white"
                @click="confirmEdit(data.id)"
              />

              <Button
                v-if="can('delete_product_categories')"
                icon="pi pi-trash"
                text
                rounded
                class="w-9! h-9! border-surface-200! text-surface-200! hover:text-red-600! hover:border-red-500 hover:bg-red-50 bg-white"
                @click="confirmDelete(data.id)"
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
          <span class="text-sm font-medium text-surface-600"> {{ currentPage }} of {{ totalPages }} </span>

          <div class="flex gap-1">
            <Button
              icon="pi pi-chevron-left"
              text
              rounded
              severity="secondary"
              :disabled="currentPage === 1"
              class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!"
              @click="prevPage()"
            ></Button>
            <Button
              icon="pi pi-chevron-right"
              text
              rounded
              severity="secondary"
              :disabled="currentPage === totalPages"
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
