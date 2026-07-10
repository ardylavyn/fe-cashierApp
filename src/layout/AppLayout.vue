<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import AppSidebar from "./AppSidebar.vue";

const sidebarOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-surface-50 flex">
    <!-- Sidebar -->
    <AppSidebar :sidebarOpen="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Content -->
    <div class="flex-1 lg:ml-64 transition-all duration-300">
      <!-- Mobile Header -->
      <div class="fixed w-full lg:hidden h-16 bg-white border-b border-surface-200 flex items-center px-4 mb-4">
        <button @click="sidebarOpen = true">
          <i class="pi pi-bars text-xl"></i>
        </button>

        <span class="ml-3 font-bold text-lg"> Niki Echo </span>
      </div>

      <div class="p-4 pt-20 lg:p-8 lg:pt-8 mb-16">
        <RouterView />
      </div>
    </div>
  </div>
</template>
