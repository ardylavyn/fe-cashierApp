<script setup>
// ref → buat data yang bisa berubah
import { ref } from "vue";
// useRoute → untuk tau sekarang user lagi di URL apa
import { useRoute } from "vue-router";

// "sekarang user lagi di halaman apa?" CONTOH (route.path = "/" atau route.path = "/products")
const route = useRoute();

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
        ],
    },
]);
</script>

<template>
    <div
        class="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200 flex flex-col z-50 transition-all duration-300"
    >
        <!-- Logo -->
        <div class="h-20 flex items-center px-8 border-b border-surface-100">
            <div
                class="w-8 h8 bg-primary-600 rounded-lg flex items-center justify-center text-white mr-3"
            >
                <i class="pi pi-bolt text-lg" />
            </div>
            <span class="text-xl font-bold text-surface-900">Niki Echo</span>
        </div>

        <!-- Menu -->
        <div class="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
            <div v-for="(section, i) in menuItems" :key="i">
                <div
                    class="text-xs font-semibold text-surfaces-400 uppercase tracking-winder mb-3 px-3"
                >
                    {{ section.label }}
                </div>

                <!-- Tempat menu-menu dalam section ini MISALNYA (DASHBOARD, PRODUK, TRANSAKSI) -->
                <div class="flex flex-col gap-1">
                    <RouterLink
                        v-for="(item, j) in section.items"
                        :to="item.to"
                        :key="item.label"
                        class="flex items-center gap-3 px-3 py-2.5 rounder-lg transition-colors duration-200"
                        :class="[
                            route.path == item.to
                                ? 'bg-surface-100 text-primary-600'
                                : 'text-surface-900 hover:bg-surface-100',
                        ]"
                    >
                        <i :class="[item.icon, 'text-lg']"></i>
                        <span class="font-medium text-sm">{{
                            item.label
                        }}</span>
                    </RouterLink>
                </div>
            </div>
        </div>
        <!-- User Profile -->
        <div class="p-4 border-t border-surface-200">
            <div
                class="group w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-200 transition-colors"
            >
                <div
                    class="w-9 h-9 rounded-full bg-surface-200 flex items-center justify-center cursor-pointer hover:bg-surface-300 transition-colors overflow-hidden"
                >
                    <i class="pi pi-user text-lg text-surface-600"></i>
                </div>
                <div class="flex-1 text-left min-w-0">
                    <div class="text-sm font-semibold text-surface-900">
                        Ardyanto
                    </div>
                    <div class="text-xs text-surface-500 truncate">
                        ardyantows01@gmail.com
                    </div>
                </div>
                <div
                    class="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-red-200 hover:text-red-600 transition-colors cursor-pointer"
                >
                    <i class="pi pi-sign-out text-lg"></i>
                </div>
            </div>
        </div>
    </div>
</template>
