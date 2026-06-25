<script setup lang="ts">
import { getTransactionById, getTransactionOptions } from "@/api/transactions.api";
import type { Transaction } from "@/types/transaction";
import { Button, Select, DataTable, Column, Textarea, InputNumber, Checkbox } from "primevue";
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { refundTransaction } from "@/api/transactions.api";
import { useToast } from "primevue/usetoast";
import router from "@/router";

// Digunakan untuk menyimpan ID transaksi yang dipilih user dari dropdown.
const selectedTransaction = ref<number | null>(null);
// Digunakan untuk menyimpan daftar transaksi yang akan muncul pada dropdown.
const transactionOptions = ref<any[]>([]);
// Digunakan untuk menyimpan detail transaksi yang dipilih.
const transactionDetail = ref<Transaction | null>(null);
const reason = ref("");
const toast = useToast();
const loading = ref(false);

// Mengecek apakah ada minimal satu produk yang dipilih untuk direfund.
const hasRefundItem = computed(() => refundItems.value.some((item) => item.quantity > 0));

// Menyimpan item-item yang akan direfund.
const refundItems = ref<
  {
    transaction_item_id: number;
    quantity: number;
    return_to_stock: boolean;
  }[]
>([]);

// Fungsi utama untuk memproses refund.
const submitRefund = async () => {
  if (!selectedTransaction.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please select a transaction",
      life: 3000,
    });
    return;
  }

  const items = refundItems.value.filter((item) => item.quantity > 0);

  if (items.length === 0) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please select at least one item to refund",
      life: 3000,
    });
    return;
  }

  if (!reason.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Refund reason is required",
      life: 3000,
    });
    return;
  }

  try {
    loading.value = true;

    const payload = {
      reason: reason.value,
      items,
    };

    console.log("Refund Payload:", payload);

    await refundTransaction(selectedTransaction.value, payload);

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Refund processed successfully",
      life: 3000,
    });

    const res = await getTransactionById(selectedTransaction.value);

    transactionDetail.value = res.data.data;

    refundItems.value = res.data.data.transactionItems.map((item: any) => ({
      transaction_item_id: item.id,
      quantity: 0,
      return_to_stock: false,
    }));

    reason.value = "";

    router.push("/refund");
  } catch (error: any) {
    console.error(error);

    toast.add({
      severity: "error",
      summary: "Error",
      detail: error?.response?.data?.message ?? "Failed to process refund",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await getTransactionOptions();
    transactionOptions.value = res.data.data;
  } catch (error) {
    console.error("Failed fetch transaction options:", error);
  }
});

watch(selectedTransaction, async (id) => {
  if (!id) {
    transactionDetail.value = null;
    return;
  }

  try {
    const res = await getTransactionById(id);
    transactionDetail.value = res.data.data;
    refundItems.value = res.data.data.transactionItems.map((item: any) => ({
      transaction_item_id: item.id,
      quantity: 0,
      return_to_stock: false,
    }));
  } catch (error) {
    console.error("Failed fetch transaction detail:", error);
  }
});

const refundableItems = computed(() => {
  return transactionDetail.value?.transactionItems.filter((item) => item.quantity > item.refunded_quantity) ?? [];
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Create Refund</h1>
        <p class="text-surface-500 text-sm">Create and process a customer refund</p>
      </div>

      <Button as-child v-slot="slotProps">
        <RouterLink :to="{ name: 'refunds' }" :class="slotProps.class">
          <i class="pi pi-arrow-left mr-2"></i>
          Back
        </RouterLink>
      </Button>
    </div>

    <!-- SELECT TRANSACTION -->
    <div class="bg-white rounded-2xl border border-surface-200 p-6">
      <label class="block text-sm font-medium mb-2"> Transaction </label>

      <Select v-model="selectedTransaction" :options="transactionOptions" optionLabel="code" optionValue="id" placeholder="Select Transaction" class="w-full" />
    </div>

    <!-- TRANSACTION DETAIL -->
    <div v-if="transactionDetail" class="bg-white rounded-2xl border border-surface-200 p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">Transaction Information</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p class="text-sm text-surface-500">Transaction Code</p>
          <p class="font-semibold">
            {{ transactionDetail.code }}
          </p>
        </div>

        <div>
          <p class="text-sm text-surface-500">Customer</p>
          <p class="font-semibold">
            {{ transactionDetail.customer?.name }}
          </p>
        </div>

        <div>
          <p class="text-sm text-surface-500">Status</p>
          <p
            class="font-semibold capitalize"
            :class="{
              'text-green-600': transactionDetail.status === 'completed',
              'text-orange-500': transactionDetail.status === 'partially_refunded',
              'text-red-500': transactionDetail.status === 'refunded',
            }"
          >
            {{ transactionDetail.status }}
          </p>
        </div>
      </div>
    </div>

    <!-- REFUND ITEMS -->
    <div v-if="transactionDetail" class="bg-white rounded-2xl border border-surface-200 p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">Refund Items</h2>

      <DataTable :value="refundableItems" dataKey="id" responsiveLayout="scroll">
        <Column header="Product">
          <template #body="{ data }">
            {{ data.product.name }}
          </template>
        </Column>

        <Column field="quantity" header="Purchased Qty" />

        <Column field="refunded_quantity" header="Refunded Qty" />

        <Column header="Available Refund">
          <template #body="{ data }">
            {{ data.quantity - data.refunded_quantity }}
          </template>
        </Column>

        <Column header="Refund Qty">
          <template #body="{ data }">
            <InputNumber v-model="refundItems.find((item) => item.transaction_item_id === data.id)!.quantity" :min="0" :max="data.quantity - data.refunded_quantity" showButtons fluid />
          </template>
        </Column>

        <Column header="Return To Stock">
          <template #body="{ data }" class="mx-auto">
            <div class="flex justify-center">
              <Checkbox v-model="refundItems.find((item) => item.transaction_item_id === data.id)!.return_to_stock" binary />
            </div>
          </template>
        </Column>
      </DataTable>

      <div v-if="transactionDetail" class="bg-white rounded-2xl border border-surface-200 p-6 mt-6">
        <h2 class="text-lg font-semibold mb-4">Refund Reason</h2>

        <Textarea v-model="reason" rows="4" class="w-full" placeholder="Enter refund reason..." />
      </div>
      <div class="flex justify-end mt-6">
        <Button label="Process Refund" icon="pi pi-check" :loading="loading" :disabled="!hasRefundItem" @click="submitRefund" />
      </div>
    </div>
  </div>
</template>
