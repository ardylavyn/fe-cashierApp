import AppLayout from "@/layout/AppLayout.vue";
import Login from "@/pages/auth/Login.vue";
import CustomerForm from "@/pages/customers/CustomerForm.vue";
import CustomerList from "@/pages/customers/CustomerList.vue";
import Dashboard from "@/pages/Dashboard.vue";
import POSView from "@/pages/pos/PosView.vue";
import CategoryForm from "@/pages/product-categoires/CategoryForm.vue";
import CategoryList from "@/pages/product-categoires/CategoryList.vue";
import ProductsForm from "@/pages/products/ProductsForm.vue";
import ProductsList from "@/pages/products/ProductsList.vue";
import RefundForm from "@/pages/refunds/RefundForm.vue";
import RefundsList from "@/pages/refunds/RefundsList.vue";
import TransactionsForm from "@/pages/transactions/TransactionsForm.vue";
import TransactionsList from "@/pages/transactions/TransactionsList.vue";
import Forbidden from "@/pages/Forbidden.vue";
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
      path: "/403",
      name: "forbidden",
      component: Forbidden,
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
          meta: { permission: "view_dashboard_statistics" },
        },
        {
          path: "/product-categories",
          name: "product-categories",
          component: CategoryList,
          meta: { permission: "view_product_categories" },
        },
        {
          path: "/product-categories/create",
          name: "product-categories-create",
          component: CategoryForm,
          meta: { permission: "create_product_categories" },
        },
        {
          path: "/product-categories/:id/edit",
          name: "product-categories-edit",
          component: CategoryForm,
          meta: { permission: "edit_product_categories" },
        },
        {
          path: "/products",
          name: "products",
          component: ProductsList,
          meta: { permission: "view_products" },
        },
        {
          path: "/products/create",
          name: "products-create",
          component: ProductsForm,
          meta: { permission: "create_products" },
        },
        {
          path: "/products/:id/edit",
          name: "products-edit",
          component: ProductsForm,
          meta: { permission: "edit_products" },
        },
        {
          path: "/customers",
          name: "customers",
          component: CustomerList,
          meta: { permission: "view_customers" },
        },
        {
          path: "/customers/create",
          name: "customers-create",
          component: CustomerForm,
          meta: { permission: "create_customers" },
        },
        {
          path: "/customers/:id/edit",
          name: "customers-edit",
          component: CustomerForm,
          meta: { permission: "edit_customers" },
        },
        {
          path: "/transaction",
          name: "transactions",
          component: TransactionsList,
          meta: { permission: "view_transactions" },
        },
        {
          path: "/transactions/:id/show",
          name: "transactions-show",
          component: TransactionsForm,
          meta: { permission: "view_transactions" },
        },
        {
          path: "/refund",
          name: "refunds",
          component: RefundsList,
          meta: { permission: "view_refunds" },
        },
        {
          path: "/refunds/create",
          name: "refunds-create",
          component: RefundForm,
          meta: { permission: "create_refunds" },
        },
        {
          path: "/pos",
          name: "pos",
          component: POSView,
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

  const permission = to.meta.permission as string | undefined;

  if (permission && auth.user && !auth.hasPermission(permission)) {
    return "/403";
  }

  /*
   * Semua pengecekan lolos
   *
   * User boleh masuk halaman yang dituju
   */
  return true;
});

export default router;
