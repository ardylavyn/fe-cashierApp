<script setup lang="ts">
import { getProductsOptions } from "@/api/products.api";
import { createCustomer } from "@/api/customers.api";
import { usePosStore } from "@/stores/pos.store";
import { useCustomerStore } from "@/stores/customer.store";
import type { Product } from "@/types/product";
import { useDebounceFn } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { Button, Checkbox, Dialog, IconField, InputIcon, InputNumber, InputText, Select, useToast } from "primevue";
import { onMounted, ref } from "vue";

const loading = ref(false);
const errors = ref<Record<string, string[]>>({});
const products = ref<Product[]>([]);
const productsLoading = ref(false);
const productsSearch = ref("");
const paymentAmount = ref(0);
const customerId = ref<number | null>(null);
const customerDialog = ref(false);
const toast = useToast();
const sendNotification = ref(false);

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

const customerForm = ref({
  name: "",
  phone: "",
});

// Receipt Modal
const showReceiptModal = ref(false);
const receiptData = ref<{
  date: string;
  code: string;
  customer: string;
  phone: string;
  items: {
    name: string;
    qty: string;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  payment: number;
  change: number;
} | null>(null);

const saveCustomer = async () => {
  loading.value = true;
  try {
    const res = await createCustomer(customerForm.value);

    await fetch();

    customerId.value = res.data.data.id;

    customerDialog.value = false;

    customerForm.value = {
      name: "",
      phone: "",
    };

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Customer created successfully",
      life: 3000,
    });
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response?.data.errors ?? {};
      return;
    }
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message,
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const PosStore = usePosStore();
const { cart, subtotal, tax, total } = storeToRefs(PosStore);
const { addToCart, removeFromCart, updateQuantity, clearCart, checkout } = PosStore;

const CustomerStore = useCustomerStore();
const { fetch } = CustomerStore;
const { items } = storeToRefs(CustomerStore);
console.log(items.value);

const onSearch = useDebounceFn(() => {
  // Kalau ada pencarian baru, tampilkan hasil dari halaman pertama.
  loadProducts(productsSearch.value);
}, 400);

const loadProducts = async (search?: string) => {
  productsLoading.value = true;

  try {
    const res = await getProductsOptions({
      search: search || undefined,
      limit: 10,
    });

    products.value = res.data.data;
  } catch (error) {
    console.log(error);
  } finally {
    productsLoading.value = false;
  }
};

const handleCheckout = async () => {
  if (!customerId.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please select a customer",
      life: 3000,
    });
    return;
  }
  if (cart.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please add at least one item to the cart",
      life: 3000,
    });
    return;
  }

  if (paymentAmount.value < total.value) {
    toast.add({
      severity: "warn",
      summary: "Warning",
      detail: "Please amount is less than the total",
      life: 3000,
    });
    return;
  }

  try {
    PosStore.customerId = customerId.value;

    const res = await checkout(paymentAmount.value, sendNotification.value);
    console.log(res);

    await loadProducts(productsSearch.value);

    receiptData.value = {
      code: res.code,
      customer: res.customer.name,
      phone: res.customer.phone,
      date: res.created_at,
      items: res.transactionItems.map((item: any) => ({
        name: item.product.name,
        qty: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })),
      subtotal: res.subtotal,
      tax: res.tax,
      total: res.total,
      payment: paymentAmount.value,
      change: paymentAmount.value - res.total,
    };

    customerId.value = null;
    PosStore.customerId = null;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Transaction created successfully",
      life: 3000,
    });

    setTimeout(() => {
      showReceiptModal.value = true;
    }, 700);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message ?? "An error occured",
      life: 3000,
    });
  }
};

const shareToWhatsapp = () => {
  if (!receiptData.value) return;

  const detailItems = receiptData.value.items.map((item) => `• ${item.name} ${item.qty} x Rp ${item.price.toLocaleString("id-ID")} = Rp ${item.subtotal.toLocaleString("id-ID")}`).join("\n");

  const phone = receiptData.value.phone.replace(/^0/, "62");

  const message = `FAKTUR ELEKTRONIK TRANSAKSI REGULER
NIKI ECHO
Walikota Mustajab No.08
6282330388700

Nomor Nota :
${receiptData.value.code}

Pelanggan Yth :
${receiptData.value.customer}
Tanggal Pemesanan :
${formatDate(receiptData.value.date)}

=======================

Detail pesanan:
${detailItems}

• PPN: Rp. ${Number(receiptData.value.tax).toLocaleString("id-ID")}
• Total: Rp. ${Number(receiptData.value.total).toLocaleString("id-ID")}


Terima kasih`;

  window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

onMounted(() => {
  loadProducts();
  fetch();
});
</script>
<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">POS</h1>
        <p class="text-surface-500 text-sm">Create a new transaction</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LIST PRODUK KIRI -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl border border-surface-200 p-4">
          <!-- SEARCH -->
          <IconField iconPosition="left" class="mb-4">
            <InputIcon class="pi pi-search text-surface-500" />
            <InputText placeholder="Search" class="w-full bg-surface-50 border-surface-200 focus:bg-white focus:border-primary-500" v-model="productsSearch" @input="onSearch" />
          </IconField>

          <!-- PRODUCTS -->
          <div v-if="productsLoading" class="text-center py-12 text-surface-500">Loading products...</div>
          <div v-else-if="products.length === 0" class="text-center py-12 text-surface-500">No products found</div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              @click="addToCart(product)"
              v-for="product in products"
              :key="product.id"
              class="group p-3 rounded-xl border border-surface-200 hover:border-surface-500 hover:shadow-md transition-all text-left bg-white"
              :disabled="product.stock === 0"
              :class="product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <div class="aspect-square rounded-lg bg-surface-100 mb-2 overflow-hidden">
                <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-surface-500 text-sm">No Image</span>
                </div>
              </div>
              <div class="text-sm font-medium text-surface-900 truncate">{{ product.name }}</div>
              <div class="text-sm font-medium text-primary-600 truncate">
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(Number(product.price))
                }}
              </div>
              <div class="text-xs text-surface-500">Stock: {{ product.stock }}</div>
            </button>
          </div>
        </div>
      </div>
      <!-- CART KANAN -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-surface-200 p-4 sticky top-4">
          <h2 class="text-lg font-semibold text-surface-900 mb-4">Cart</h2>

          <div class="pr-2 pb-2">
            <span class="text-sm text-surface-700 font-semibold">Customer</span>
            <div class="flex items-center gap-2 py-2 w-full">
              <!-- SELECT CUSTOMER-->
              <div class="flex-1 min-w-0">
                <Select
                  v-model="customerId"
                  :options="items"
                  optionLabel="name"
                  placeholder="Select customer"
                  optionValue="id"
                  filter
                  filterPlaceholder="Search  customer"
                  showClear
                  :appendTo="'self'"
                  class="w-full"
                >
                  <template #option="slotProps">
                    <div>
                      <div class="font-medium">
                        {{ slotProps.option.name }}
                      </div>
                      <div class="text-xs text-surface-500">
                        {{ slotProps.option.phone }}
                      </div>
                    </div>
                  </template>
                </Select>
              </div>

              <!-- BUTTON CREATE CUSTOMER-->
              <Button icon="pi pi-plus" text severity="secondary" class="bg-surface-200! text-black shrink-0" @click="customerDialog = true" />
              <Dialog v-model:visible="customerDialog" modal header="Create Customer" :style="{ width: '500px' }">
                <div class="space-y-4">
                  <div>
                    <label class="font-semibold">Name <span class="text-red-500">*</span></label>
                    <InputText v-model="customerForm.name" class="w-full" />
                  </div>

                  <div>
                    <label class="font-semibold">Phone <span class="text-red-500">*</span></label>
                    <InputText v-model="customerForm.phone" class="w-full" />
                  </div>

                  <div class="flex justify-end gap-2">
                    <Button label="Cancel" severity="secondary" @click="customerDialog = false" />

                    <Button icon="pi pi-check" label="Save Customer" @click="saveCustomer" />
                  </div>
                </div>
              </Dialog>
            </div>
          </div>
          <span class="text-sm text-surface-700 font-semibold">Ordered items</span>
          <div v-if="cart.length === 0" class="text-center py-8 text-surface-400">
            <i class="pi pi-shopping-cart text-3xl mb-2"></i>
            <p class="text-sm">Cart is empty</p>
          </div>

          <div v-else class="space-y-2 mb-4 max-h-50 overflow-y-auto">
            <div v-for="item in cart" :key="item.product.id" class="p-3 rounded-lg bg-surface-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-surface-200 overflow-hidden flex-shrink-0">
                  <img v-if="item.product.image" :src="item.product.image" class="w-full h-full object-cover" alt="" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-surface-500 text-sm">No Image</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-surface-900 truncate">
                    {{ item.product.name }}
                  </div>
                  <div class="text-xs font-medium text-primary-500 truncate">
                    {{
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(Number(item.product.price))
                    }}
                  </div>
                </div>

                <Button icon="pi pi-trash" text rounded size="small" severity="danger" class="w-7 h-7 flex-shrink-0" @click="removeFromCart(item.product.id)"></Button>
              </div>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-surface-200">
                <div class="flex items-center gap-1">
                  <Button icon="pi pi-minus" text rounded size="small" severity="secondary" class="w-7 h-7" @click="updateQuantity(item.product.id, item.quantity - 1)" />

                  <span class="w-8 text-center text-sm font-medium">
                    {{ item.quantity }}
                  </span>

                  <Button icon="pi pi-plus" text rounded size="small" severity="secondary" class="w-7 h-7" @click="updateQuantity(item.product.id, item.quantity + 1)" />
                </div>
                <div class="text-sm font-semibold text-surface-900">
                  {{
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(Number(item.product.price * item.quantity))
                  }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="cart.length > 0" class="border-t border-surface-900 pt-4 space-y-2">
            <div class="flex justify-between text-sm text-surface-600">
              <span>Subtotal</span>
              <span>{{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(Number(subtotal))
              }}</span>
            </div>
            <div class="flex justify-between text-sm text-surface-600">
              <span>Tax (11%)</span>
              <span>{{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(Number(tax))
              }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-surface-800 border-t border-surface-200 pt-2">
              <span>Total</span>
              <span>{{
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(Number(subtotal + tax))
              }}</span>
            </div>
            <div class="pt-3 border-t border-surface-100">
              <label class="text-sm font-medium text-surface-700 mb-2 block">Payment Amount</label>
              <InputNumber v-model="paymentAmount" mode="currency" currency="IDR" locale="id-ID" placeholder="Enter amount" class="w-full" />
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="sendNotification" class="w-4 h-4 text-primary-500 rounded border-surface-200 focus:border-primary-500 focus:ring-primary-500" />
              <label>Send Notification</label>
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <Button label="Checkout" icon="pi pi-check" class="w-full" @click="handleCheckout" />
            <Button label="Clear Cart" icon="pi pi-trash" class="w-full" severity="secondary" :disabled="cart.length === 0" @click="clearCart()" />
          </div>
        </div>
      </div>

      <Dialog v-model:visible="showReceiptModal" modal :closable="true" :style="{ width: '450px' }" header="Transaction Receipt">
        <div v-if="receiptData" class="space-y-5">
          <!-- HEADER -->
          <div class="text-center border-b border-surface-200 pb-4">
            <h2 class="text-xl font-bold">Receipt</h2>
            <p class="text-sm text-surface-500">Thank you for your purchase</p>
          </div>

          <!-- INFO -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-surface-500">Transaction Code</span>
              <span class="font-semibold">{{ receiptData.code }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-surface-500">Customer</span>
              <span class="font-semibold">{{ receiptData.customer }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-surface-500">Date</span>
              <span>{{ formatDate(receiptData.date) }}</span>
            </div>
          </div>

          <!-- ITEMS -->
          <div>
            <div class="font-semibold mb-2">Ordered Items</div>

            <div v-for="item in receiptData.items" :key="item.name" class="flex justify-between py-2 border-b border-dashed border-surface-200">
              <div>
                <div class="font-medium">
                  {{ item.name }}
                </div>

                <div class="text-xs text-surface-500">
                  {{ item.qty }} ×
                  {{
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(item.price)
                  }}
                </div>
              </div>

              <div class="font-medium">
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(item.subtotal)
                }}
              </div>
            </div>
          </div>

          <!-- TOTAL -->
          <div class="border-t border-surface-300 pt-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(receiptData.subtotal)
                }}
              </span>
            </div>

            <div class="flex justify-between">
              <span>Tax (11%)</span>
              <span>
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(receiptData.tax)
                }}
              </span>
            </div>

            <div class="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(receiptData.total)
                }}
              </span>
            </div>

            <div class="flex justify-between">
              <span>Payment</span>
              <span>
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(receiptData.payment)
                }}
              </span>
            </div>

            <div class="flex justify-between text-green-600 font-bold text-base">
              <span>Change</span>
              <span>
                {{
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(receiptData.change)
                }}
              </span>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="text-center border-t border-surface-200 pt-4">
            <p class="text-sm text-surface-500">Thank you for shopping</p>
          </div>

          <!-- ACTION -->
          <div class="flex justify-end gap-2 pt-2">
            <Button label="Close" severity="secondary" @click="showReceiptModal = false" />

            <Button label="Print" severity="info" icon="pi pi-print" />

            <Button label="Share" icon="pi pi-whatsapp" severity="success" @click="shareToWhatsapp" />
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>
