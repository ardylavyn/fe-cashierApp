import type { Transaction } from "./transaction";
import type { Customer } from "./customer";
import type { TransactionItem } from "./transaction-item";

export interface Refund {
  id: number;
  transaction: Transaction;
  customer: Customer;
  reason: string;
  transactionItems: TransactionItem[];
  created_at: string;
}
