<script setup lang="ts">
import { Button } from "primevue";
</script>
<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div class="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-10 text-center">
      <!-- Icon -->
      <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-red-100">
        <i class="pi pi-lock text-red-500"></i>
      </div>

      <!-- Error Code -->
      <h1 class="mt-8 text-6xl font-extrabold text-slate-900">403</h1>

      <h2 class="mt-2 text-2xl font-bold text-red-500">Access Denied</h2>

      <p class="mt-4 text-slate-500 leading-7">Maaf, Anda tidak memiliki hak akses untuk membuka halaman ini.</p>

      <!-- Information -->
      <div class="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-left">
        <div class="flex gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <i class="pi pi-info-circle text-red-500"></i>
          </div>

          <div>
            <h3 class="font-semibold text-slate-800">Permission Required</h3>

            <p class="mt-1 text-sm text-slate-500">Anda tidak memiliki permission untuk mengakses halaman ini. Silakan hubungi administrator apabila menurut Anda ini adalah sebuah kesalahan.</p>
          </div>
        </div>
      </div>

      <!-- Button -->
      <!-- Action Button -->
      <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <Button label="Go Back" icon="pi pi-arrow-left" severity="secondary" outlined class="w-full sm:w-auto flex-1" @click="$router.back()" />

        <Button label="Go to Dashboard" icon="pi pi-home" class="w-full sm:w-auto flex-1" @click="$router.push('/')" />
      </div>
    </div>
  </div>
</template>
