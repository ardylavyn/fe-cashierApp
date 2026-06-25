<script setup lang="ts">
import { Button, Column, DataTable } from "primevue";
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { getTransactionById } from "@/api/transactions.api";
import { useTransactionStore } from "@/stores/transaction.store";
import { storeToRefs } from "pinia";
import type { TransactionItem } from "@/types/transaction-item";
const TransactionStore = useTransactionStore();
const { pagination, limit } = storeToRefs(TransactionStore);
const route = useRoute();

const transactionId = computed<number | null>(() => (route.params.id ? Number(route.params.id) : null));

const form = ref({
  id: 0,
  code: "",
  customer: null as {
    id: number;
    name: string;
    phone: string;
  } | null,
  // Ini memang array kosong, tapi nanti isinya adalah TransactionItem.
  transactionItems: [] as TransactionItem[],
  status: "",
  refund: null as {
    id: number;
    reason: string;
    created_at: string;
  } | null,
  created_at: "",
  subtotal: "",
  tax: "",
  total: "",
});

const formatDate = (date: string) => {
  const d = new Date(date);

  const tanggal = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${tanggal}, ${jam}`;
};

onMounted(async () => {
  if (!transactionId.value) return;
  const res = await getTransactionById(transactionId.value);

  const data = res.data.data;

  form.value = data;
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">
          <span>Transaction detail</span>
        </h1>
        <p class="text-surface-500 text-sm">
          <span>View transaction information</span>
        </p>
      </div>

      <Button as-child v-slot="slotProps">
        <!-- name itu dari index.ts -->
        <RouterLink :to="{ name: 'transactions' }" :class="slotProps.class">
          <i class="pi pi-arrow-left" />
          Back
        </RouterLink>
      </Button>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      <div class="p-6 md:p-6">
        <span class="text-lg font-semibold">Transaction Information</span>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          <div>
            <p class="text-sm text-surface-500 mb-2">Transaction Code</p>
            <p class="font-bold text-green-700">{{ form.code }}</p>
          </div>

          <div>
            <p class="text-sm text-surface-500 mb-2">Customer</p>
            <p class="font-semibold">{{ form.customer?.name }}</p>
          </div>

          <div>
            <p class="text-sm text-surface-500 mb-2">Date</p>
            <p class="font-semibold">{{ formatDate(form.created_at) }}</p>
          </div>

          <div>
            <p class="text-sm text-surface-500 mb-2">Total</p>
            <p class="font-bold text-lg text-green-600">
              {{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(Number(form.total))
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden mt-6">
      <div class="p-6">
        <span class="text-lg font-semibold">Items</span>

        <DataTable :value="form.transactionItems" class="mt-5" tableStyle="min-width: 50rem">
          <Column header="No.">
            <template #body="{ index }">
              {{ (pagination.current_page - 1) * limit + index + 1 }}
            </template>
          </Column>
          <Column header="Product">
            <template #body="{ data }">
              {{ data.product.name }}
            </template>
          </Column>

          <Column header="Price">
            <template #body="{ data }">
              {{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(data.price)
              }}
            </template>
          </Column>

          <Column field="quantity" header="Qty" />

          <Column header="Subtotal">
            <template #body="{ data }">
              {{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(Number(data.subtotal))
              }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden mt-6">
      <div class="p-6">
        <span class="text-lg font-semibold">Refund Information</span>

        <div v-if="form.refund" class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 mt-6">
          <div>
            <p class="text-sm text-surface-500 mb-1">Refund ID</p>
            <p class="font-semibold">{{ form.refund.id }}</p>
          </div>

          <div>
            <p class="text-sm text-surface-500 mb-1">Status</p>
            <span class="inline-flex px-3 py-1 rounded-full text-sm font-medium" :class="form.status === 'partially_refunded' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'">
              {{ form.status }}
            </span>
          </div>

          <div>
            <p class="text-sm text-surface-500 mb-1">Reason</p>
            <p class="font-semibold">{{ form.refund.reason }}</p>
          </div>

          <div>
            <p class="text-sm text-surface-500 mb-1">Refund Date</p>
            <p class="font-semibold">
              {{ formatDate(form.refund.created_at) }}
            </p>
          </div>
        </div>

        <div v-else class="mt-6 text-surface-500">This transaction has not been refunded.</div>

        <DataTable v-if="form.refund" :value="form.transactionItems.filter((item) => item.refunded_quantity > 0)" class="mt-8">
          <Column header="Product">
            <template #body="{ data }">
              {{ data.product.name }}
            </template>
          </Column>

          <Column field="quantity" header="Purchased Qty" />

          <Column field="refunded_quantity" header="Refunded Qty" />

          <Column header="Remaining Qty">
            <template #body="{ data }">
              {{ data.quantity - data.refunded_quantity }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden mt-6">
      <div class="p-6 md:p-6">
        <span class="text-lg font-semibold">Summary</span>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <!-- KIRI -->
          <div class="md:col-span-2 p-6"></div>

          <!-- KANAN -->
          <div class="grid md:grid-cols-2 md:col-span-1">
            <span class="text-md font-medium text-surface-400">Subtotal</span>
            <span class="text-md text-right font-semibold">{{
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(Number(form.subtotal))
            }}</span>

            <span class="text-md font-medium text-surface-400 py-3">Tax</span>
            <span class="text-md font-semibold py-3 text-right">{{
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(Number(form.tax))
            }}</span>

            <hr class="col-span-2 border-surface-200 my-3" />

            <span class="text-md font-bold">Total</span>
            <span class="text-md text-right text-green-600 font-bold">{{
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(Number(form.total))
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
