<script setup lang="ts">
// PrimeVue components (V4 cara benar)
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import router from "@/router";
import { Message } from "primevue";

const auth = useAuthStore();
const error = ref<string | null>(null);
const form = ref({
  email: "",
  password: "",
});

async function login() {
  error.value = null;

  if (!form.value.email || !form.value.password) {
    error.value = "Email and Password are required";
    return;
  }

  try {
    await auth.login(form.value.email, form.value.password);
    router.push({ name: "dashboard" });
  } catch (e) {
    error.value = "invalid email or password";
  }
}

const showPassword = ref(false);
</script>

<template>
  <div class="min-h-screen grid md:grid-cols-2">
    <!-- KIRI -->
    <div class="hidden md:flex flex-col justify-center p-12">
      <div class="flex-col justify-center px-12 pt-5 text-black">
        <h1 class="text-4xl font-bold mb-4 max-w-90">Kasir Modern, Cepat & Praktis</h1>

        <p class="text-sm max-w-115 opacity-90">Sistem Point of Sale (POS) yang memudahkan transaksi penjualan, manajemen produk, dan laporan bisnis Anda.</p>
      </div>
      <div class="flex items-center justify-center">
        <img src="@/assets/7059.jpg" alt="" class="w-100" />
      </div>
      <div class="grid grid-cols-3 gap-5 mx-auto text-black">
        <div class="flex flex-col items-center text-center">
          <div class="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center cursor-pointer overflow-hidden">
            <i class="pi pi-shield text-lg text-blue-600"></i>
          </div>

          <div>
            <p class="mt-2 font-bold text-sm">Aman & Terpercaya</p>
            <span class="text-surface-400 text-xs font-md">Transaksi terlindungi</span>
          </div>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="w-9 h-9 rounded-md bg-green-100 flex items-center justify-center cursor-pointer overflow-hidden">
            <i class="pi pi-bolt text-lg text-green-600"></i>
          </div>

          <div>
            <p class="mt-2 font-bold text-sm">Proses Cepat</p>
            <span class="text-surface-400 text-xs font-md">Checkout lebih efisien</span>
          </div>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="w-9 h-9 rounded-md bg-blue-100 flex items-center justify-center cursor-pointer overflow-hidden">
            <i class="pi pi-chart-line text-lg text-blue-600"></i>
          </div>

          <div>
            <p class="mt-2 font-bold text-sm">Laporan Lengkap</p>
            <span class="text-surface-400 text-xs font-md">Analisis penjualan real-time</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KANAN -->
    <div class="flex items-center justify-center px-6 bg-primary">
      <div class="w-full max-w-100">
        <div class="bg-white p-8 rounded-2xl shadow-xl border border-surface-100">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-surface-900 mb-2">Welcome Back</h1>

            <p class="text-surface-500">Please sign in to your account</p>
          </div>

          <form @submit.prevent="login" class="flex flex-col gap-5">
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <div class="flex flex-col gap-2">
              <label>Email</label>

              <IconField>
                <InputIcon class="pi pi-envelope" />
                <InputText v-model="form.email" placeholder="nama@gmail.com" fluid />
              </IconField>
            </div>

            <div class="flex flex-col gap-2">
              <label>Password</label>

              <IconField>
                <InputIcon class="pi pi-lock" />
                <InputText v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="********" fluid />
                <InputIcon :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="cursor-pointer" @click="showPassword = !showPassword" />
              </IconField>
            </div>

            <Button type="submit" label="Login" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
