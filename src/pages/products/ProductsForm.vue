<script setup lang="ts">
import { Button, FileUpload, InputText, Message, Select, useToast } from "primevue";
import { computed, ref } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { onMounted } from "vue";
import { useProductCategoryStore } from "@/stores/product-category.store";
import { storeToRefs } from "pinia";
import { createProduct, getProductById, updateProduct, uploadProductImage } from "@/api/products.api";

const route = useRoute();
const toast = useToast();

// JADIKAN SATU FILE ANTARA EDIT DAN CREATE
const productId = computed<number | null>(() => (route.params.id ? Number(route.params.id) : null));
const isEdit = computed(() => !!productId.value);

// AMBIL DATA CATEGORY UNTUK OPTIONS
const productCategoryStore = useProductCategoryStore();
const { fetchOptions } = productCategoryStore;
const { options } = storeToRefs(productCategoryStore);

// UPLOAD IMAGE
const imagePreview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const onFileSelect = (event: { files: File[] }) => {
  const file = event.files[0];
  if (!file) return;
  selectedFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

// CREATE AND UPDATE PRODUCT
const loading = ref(false);
const errors = ref<Record<string, string[]>>({});
const form = ref({
  id: 0,
  name: "",
  product_category_id: undefined as number | undefined,
  price: "",
  stock: "",
});
const submit = async () => {
  loading.value = true;

  try {
    if (isEdit.value) {
      await updateProduct(form.value.id, {
        name: form.value.name,
        product_category_id: form.value.product_category_id,
        stock: form.value.stock,
        price: form.value.price,
      });
    } else {
      const res = await createProduct({
        name: form.value.name,
        product_category_id: form.value.product_category_id,
        stock: form.value.stock,
        price: form.value.price,
      });

      form.value.id = res.data.data.id;
    }

    if (selectedFile.value) {
      const fd = new FormData();
      fd.append("image", selectedFile.value);

      await uploadProductImage(form.value.id, fd);
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: isEdit.value ? "Product updated successfully" : "Product created successfully",
      life: 3000,
    });

    router.push("/products");
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response?.data.errors ?? {};
      return;
    }

    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message,
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchOptions(); // penting

  if (!productId.value) return;

  const res = await getProductById(productId.value);
  console.log("Response:", res.data);
  const data = res.data.data;

  form.value.id = data.id;
  form.value.name = data.name;
  form.value.product_category_id = data.category?.id; // FIX UTAMA
  form.value.stock = data.stock;
  form.value.price = data.price;
  imagePreview.value = data.image;
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">
          <span v-if="isEdit">Edit product</span>
          <span v-else>Create Product</span>
        </h1>
        <p class="text-surface-500 text-sm">
          <span v-if="isEdit"> Update product detail</span>
          <span v-else> Create a new product</span>
        </p>
      </div>

      <Button as-child v-slot="slotProps">
        <!-- name itu dari index.ts -->
        <RouterLink :to="{ name: 'products' }" :class="slotProps.class">
          <i class="pi pi-arrow-left" />
          Back
        </RouterLink>
      </Button>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      <form @submit.prevent="submit">
        <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div class="md:col-span-4 flex flex-col gap-4">
            <label class="text-sm font-semibold text-surface-900">Product Image</label>
            <div
              class="w-full aspect-square rounded-xl bg-surface-50 border-2 border-dashed border-surface-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary-500 transition-colors"
            >
              <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />

              <div v-else class="flex flex-col items-center gap-2 text-surface-600">
                <i class="pi pi-image text-4xl opacity-50" />
                <span class="text-sm font-medium">No image selected</span>
              </div>
            </div>
            <div class="flex flex-col gap-2" :class="{ 'edit-mode': isEdit }">
              <!-- CREATE -->
              <FileUpload v-if="!isEdit" mode="basic" @select="onFileSelect" :auto="false" accept="image/*" :maxFileSize="2000000" chooseLabel="Choose Image" class="w-full" />

              <!-- EDIT -->
              <FileUpload v-else mode="basic" @select="onFileSelect" :auto="false" accept="image/*" :maxFileSize="2000000" chooseLabel="Change Image" class="w-full" />

              <small class="text-surface-500 text-xs text-center"> Max size: 2MB. Formats: JPG, PNG </small>
            </div>
          </div>

          <div class="md:col-span-8 flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label for="name" class="font-medium text-surface-900">Name <span class="text-red-500">*</span></label>
              <InputText id="name" v-model="form.name" type="text" placeholder="Product name" fluid class="bg-surface-50! focus:bg-white! border-surface-200!" :invalid="!!errors.name" />

              <Message v-if="errors.name" severity="error" size="small" variant="simple">
                {{ errors.name[0] }}
              </Message>
            </div>

            <div class="flex flex-col gap-2">
              <label for="price" class="font-medium text-surface-900">Category <span class="text-red-500">*</span></label>
              <Select
                id="category"
                v-model="form.product_category_id"
                :options="options"
                optionLabel="name"
                optionValue="id"
                placeholder="Select category"
                fluid
                class="bg-surface-50! focus:bg-white! border-surface-200!"
                :invalid="!!errors.product_category_id"
              />
              <Message v-if="errors.product_category_id" severity="error" size="small" variant="simple">
                {{ errors.product_category_id[0] }}
              </Message>
            </div>

            <div class="flex gap-4 w-full">
              <div class="flex flex-col gap-2 flex-1">
                <label for="price" class="font-medium text-surface-900"> Price <span class="text-red-500">*</span> </label>
                <InputText id="price" v-model="form.price" placeholder="Rp 0,00" fluid class="bg-surface-50! focus:bg-white! border-surface-200!" :invalid="!!errors.price" />
                <Message v-if="errors.price" severity="error" size="small" variant="simple">
                  {{ errors.price[0] }}
                </Message>
              </div>
              <div class="flex flex-col gap-2 flex-1">
                <label for="stock" class="font-medium text-surface-900"> Stock <span class="text-red-500">*</span> </label>
                <InputText id="stock" v-model="form.stock" placeholder="0" fluid class="bg-surface-50! focus:bg-white! border-surface-200!" :invalid="!!errors.stock" />
                <Message v-if="errors.stock" severity="error" size="small" variant="simple">
                  {{ errors.stock[0] }}
                </Message>
              </div>
            </div>

            <div class="flex justify-end pt-4 mt-auto border-top border-surface-100">
              <div class="flex gap-3">
                <Button label="Cancel" severity="secondary" text @click="router.back()"></Button>
                <Button type="submit" :label="isEdit ? 'Update Product' : 'Save Product'" icon="pi pi-check"></Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
:deep(.edit-mode .p-fileupload-basic-content .p-button-label) {
  display: inline;
}

:deep(.edit-mode .p-fileupload-basic-content span:not(.p-button-label)) {
  display: none;
}
</style>
