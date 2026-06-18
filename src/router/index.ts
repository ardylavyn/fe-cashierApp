import AppLayout from "@/layout/AppLayout.vue";
import Login from "@/pages/auth/Login.vue";
import Dashboard from "@/pages/Dashboard.vue";
import CategoryList from "@/pages/product-categoires/CategoryList.vue";
import { useAuthStore } from "@/stores/auth.store";
import { createRouter, createWebHistory } from "vue-router";

// Membuat router Vue
const router = createRouter({
  // Menggunakan mode URL normal (tanpa #)
  history: createWebHistory(import.meta.env.BASE_URL),

  // Daftar halaman yang ada di aplikasi
  routes: [
    {
      // Halaman login
      path: "/login",
      // Nama route
      name: "login",
      // Component yang ditampilkan
      component: Login,
      // guest:true artinya halaman ini hanya untuk user yang BELUM login
      meta: { guest: true },
    },

    {
      path: "/",
      component: AppLayout,

      // requiresAuth:true artinya halaman ini wajib login
      meta: { requiresAuth: true },

      children: [
        {
          // Path kosong artinya tetap "/" karena dia berada di dalam AppLayout
          path: "",
          name: "dashboard",
          component: Dashboard,
        },
        {
          path: "/product-categories",
          name: "product-categories",
          component: CategoryList,
        },
      ],
    },
  ],
});

/*
|--------------------------------------------------------------------------
| Route Guard (Satpam Router)
|--------------------------------------------------------------------------
|
| beforeEach akan dijalankan SETIAP KALI user ingin membuka halaman.
|
| Contoh:
| - buka /login
| - buka /
| - pindah halaman
|
| Sebelum halaman ditampilkan,
| router akan bertanya:
|
| "User ini boleh masuk atau tidak?"
|
*/
router.beforeEach(async (to) => {
  /*
   * Ambil data auth dari Pinia
   *
   * Misalnya:
   * {
   *   user: null,
   *   isAuthenticated: false
   * }
   */
  const auth = useAuthStore();

  /*
   * Jika:
   * - ada token (isAuthenticated = true)
   * - tetapi data user belum ada (user = null)
   *
   * biasanya terjadi setelah refresh browser.
   *
   * Token masih tersimpan di localStorage,
   * tapi Pinia baru dibuat ulang sehingga user kembali null.
   *
   * Maka kita harus mengambil data user ke backend.
   */
  if (auth.isAuthenticated && !auth.user) {
    try {
      /*
       * Memanggil:
       * GET /api/v1/me
       *
       * Tujuannya:
       * "Backend, token ini milik siapa?"
       */
      await auth.fetchUser();
    } catch {
      /*
       * Jika gagal:
       * biasanya token sudah tidak valid atau expired.
       *
       * Maka:
       * - hapus token
       * - hapus user
       * - anggap belum login
       */
      auth.logout();

      /*
       * Paksa kembali ke halaman login
       */
      return "/login";
    }
  }

  /*
   * Jika halaman yang dituju WAJIB LOGIN
   *
   * Contoh:
   * /
   *
   * dan user belum login
   */
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    /*
     * Lempar ke halaman login
     */
    return "/login";
  }

  /*
   * Jika halaman yang dituju hanya untuk guest
   *
   * Contoh:
   * /login
   *
   * tetapi user SUDAH login
   */
  if (to.meta.guest && auth.isAuthenticated) {
    /*
     * Tidak perlu lihat halaman login lagi
     * langsung ke dashboard
     */
    return "/";
  }

  /*
   * Semua pengecekan lolos
   *
   * User boleh masuk halaman yang dituju
   */
  return true;
});

export default router;
