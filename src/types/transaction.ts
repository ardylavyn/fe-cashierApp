import type { Customer } from "./customer";
import type { Refund } from "./refund";
import type { TransactionItem } from "./transaction-item";

export interface Transaction {
  id: number;
  code: string;
  status: string;
  refund?: Refund;
  customer: Customer | null;
  transactionItems: TransactionItem[];
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
}
