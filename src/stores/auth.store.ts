import { defineStore } from "pinia";
import type { User } from "@/types/user";

// Import endpoint auth
// loginApi  -> POST /login
// meApi     -> GET /me
// logoutApi -> POST /logout
import { loginApi, logoutApi, meApi } from "@/api/aut.api";

// Membuat Auth Store dengan nama "auth"
export const useAuthStore = defineStore("auth", {
  state: () => ({
    /*
     * Data user yang sedang login
     *
     * Awalnya null karena kita belum tahu
     * siapa user yang sedang login
     */
    user: null as User | null,

    /*
     * Digunakan untuk loading login
     *
     * Contoh:
     * tombol login bisa dibuat disabled
     * saat request sedang berjalan
     */
    loading: false,

    /*
     * Cek apakah browser punya token
     *
     * Kalau ada:
     * isAuthenticated = true
     *
     * Kalau tidak ada:
     * isAuthenticated = false
     */
    isAuthenticated: !!localStorage.getItem("token"),
  }),

  getters: {
    hasPermission:
      (state) =>
      (permission: string): boolean => {
        return state.user?.permissions?.includes(permission) ?? false;
      },
    hasRole:
      (state) =>
      (role: string): boolean => {
        return state.user?.roles?.includes(role) ?? false;
      },
    hasAnyPermissions:
      (state) =>
      (Permissions: string[]): boolean => {
        return Permissions.some((p) => state.user?.permissions?.includes(p) ?? false);
      },
  },

  actions: {
    /*
     * Method login
     *
     * Dipanggil saat user klik tombol Login
     */
    async login(email: string, password: string) {
      /*
       * Mulai loading
       */
      this.loading = true;

      try {
        /*
         * Kirim email & password ke backend
         *
         * POST /api/v1/login
         */
        const res = await loginApi({
          email,
          password,
        });

        /*
         * Ambil token dari response backend
         *
         * Misalnya:
         * abc123xyz
         */
        const token = res.data.data.token;

        /*
         * Simpan token ke LocalStorage
         *
         * Tujuannya supaya saat browser refresh
         * user tetap dianggap login
         */
        localStorage.setItem("token", token);

        /*
         * Tandai bahwa user sudah login
         */
        this.isAuthenticated = true;

        /*
         * Setelah token didapat,
         * ambil data user yang login
         *
         * GET /me
         */
        await this.fetchUser();
      } finally {
        /*
         * Apapun hasilnya,
         * loading dimatikan
         */
        this.loading = false;
      }
    },

    /*
     * Mengambil data user yang sedang login
     *
     * Endpoint:
     * GET /api/v1/me
     */
    async fetchUser() {
      /*
       * Panggil endpoint /me
       *
       * Backend akan membaca token
       * lalu mencari pemilik token tersebut
       */
      const res = await meApi();

      /*
       * Simpan user ke Store
       *
       * Dari:
       * null
       *
       * Menjadi:
       * {
       *   id: 1,
       *   name: "Admin Kasir",
       *   email: "admin@kasir.com"
       * }
       */
      this.user = res.data.data;
    },

    /*
     * Logout user
     */
    async logout() {
      try {
        /*
         * Beritahu backend bahwa
         * token saat ini ingin dihapus
         *
         * POST /logout
         */
        await logoutApi();
      } finally {
        /*
         * Hapus token dari browser
         */
        localStorage.removeItem("token");

        /*
         * Hapus data user dari Store
         */
        this.user = null;

        /*
         * Tandai bahwa user
         * sudah tidak login
         */
        this.isAuthenticated = false;
      }
    },
  },
});
