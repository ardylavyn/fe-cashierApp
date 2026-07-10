<script setup>
// ref → buat data yang bisa berubah
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import router from "@/router";
import { useAuthStore } from "@/stores/auth.store";
import { ref } from "vue";
// useRoute → untuk tau sekarang user lagi di URL apa
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const { user } = authStore;

// "sekarang user lagi di halaman apa?" CONTOH (route.path = "/" atau route.path = "/products")
const route = useRoute();

const logoutDialog = ref(false);
const handleLogout = async () => {
  await authStore.logout();
  logoutDialog.value = false;
  router.push({ name: "login" });
};

// Ini isi menu sidebar
const menuItems = ref([
  {
    label: "General",
    items: [
      {
        icon: "pi pi-th-large",
        // kalau diklik → pergi ke URL "/"
        to: "/",
        label: "Dashboard",
      },
      {
        icon: "pi pi-shopping-cart",
        // kalau diklik → pergi ke URL "/"
        to: "/pos",
        label: "POS",
      },
    ],
  },

  {
    label: "Manajemen",
    items: [
      {
        icon: "pi pi-tag",
        // kalau diklik → pergi ke URL "/"
        to: "/product-categories",
        label: "Product Categories",
      },
      {
        icon: "pi pi-box",
        // kalau diklik → pergi ke URL "/"
        to: "/products",
        label: "Products",
      },
      {
        icon: "pi pi-users",
        // kalau diklik → pergi ke URL "/"
        to: "/customers",
        label: "Customers",
      },
      {
        icon: "pi pi-receipt",
        // kalau diklik → pergi ke URL "/"
        to: "/transaction",
        label: "Transactions",
      },
      {
        icon: "pi pi-undo",
        // kalau diklik → pergi ke URL "/"
        to: "/refund",
        label: "Refund",
      },
    ],
  },
]);

const props = defineProps({
  sidebarOpen: Boolean,
});

const emit = defineEmits(["close"]);
</script>

<template>
  <div
    class="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200 flex flex-col z-50 transition-transform duration-300"
    :class="[props.sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0']"
  >
    <!-- Logo -->
    <div class="h-20 flex items-center px-8 border-b border-surface-100">
      <div class="w-20 h-20 rounded-lg flex items-center justify-center text-white mr-2">
        <img src="/src/assets/logo.png" alt="Logo Nikiecho" />
      </div>
      <span class="text-xl font-bold text-surface-900">Niki Echo</span>
    </div>

    <!-- Menu -->
    <div class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
      <div v-for="(section, i) in menuItems" :key="i">
        <div class="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 px-3">
          {{ section.label }}
        </div>

        <!-- Tempat menu-menu dalam section ini MISALNYA (DASHBOARD, PRODUK, TRANSAKSI) -->
        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="(item, j) in section.items"
            :key="item.label"
            :to="item.to"
            @click="emit('close')"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200"
            :class="[route.path === item.to ? 'bg-surface-100 text-primary-600' : 'text-surface-900 hover:bg-surface-100']"
          >
            <i :class="[item.icon, 'text-lg']"></i>
            <span class="font-medium text-sm">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- User Profile -->
    <div class="p-4 border-t border-surface-200">
      <button @click="logoutDialog = true" class="group w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 transition-colors">
        <div class="w-9 h-9 rounded-full bg-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-300 transition-colors overflow-hidden">
          <i class="pi pi-user text-lg text-surface-600"></i>
        </div>
        <div class="flex-1 text-left min-w-0">
          <div class="text-sm font-semibold text-surface-900">
            {{ user?.name }}
          </div>
          <div class="text-xs text-surface-500 truncate">
            {{ user?.email }}
          </div>
        </div>
        <div class="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-red-200 hover:text-red-600 transition-colors cursor-pointer">
          <i class="pi pi-sign-out text-lg"></i>
        </div>
      </button>
    </div>
  </div>

  <div v-if="props.sidebarOpen" class="fixed inset-0 bg-black/40 z-40 lg:hidden" @click="emit('close')"></div>

  <!-- Dialog Log Out -->
  <Dialog v-model:visible="logoutDialog" modal header="Confirm Logout" :modal="true" class="w-100">
    <span class="text-surface-500 block mb-8">Are u sure to logout?</span>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="logoutDialog = false" />
      <Button type="button" label="Logout" severity="danger" @click="handleLogout" />
    </div>
  </Dialog>
</template>
