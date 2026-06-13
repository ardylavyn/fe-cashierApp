import AppLayout from "@/layout/AppLayout.vue";
import Dashboard from "@/pages/Dashboard.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    // Daftar semua halaman yang akan dibuat
    routes: [
        {
            // Route utama, maka tampilkan AppLayout.vue
            path: "/",
            component: AppLayout,
            // ketika masuk AppLayout, terus ketemu RouterView, nah balik lagi ke index.ts ternyata di index ada Dashboard componentnya
            children: [
                {
                    // kenapa path kosong? karena masih bagian dari AppLayout
                    path: "",
                    name: "dashboard",
                    component: Dashboard,
                },
            ],
        },
    ],
});

export default router;
